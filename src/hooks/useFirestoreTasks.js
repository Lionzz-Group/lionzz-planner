import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';

export function useFirestoreTasks(db, userId) {
  const [tasks, setTasks] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db || !userId) {
      return;
    }

    const q = query(collection(db, 'users', userId, 'tasks'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dueDate: data.dueDate ? data.dueDate.toDate() : null,
          createdAt: data.createdAt ? data.createdAt.toDate() : null,
        };
      });
      setTasks(tasksData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, userId]);

  useEffect(() => {
    if (!db || !userId) return;

    const q = query(collection(db, 'users', userId, 'routines'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const routinesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoutines(routinesData);
    }, (error) => {
      console.error("Error fetching routines:", error);
    });

    return () => unsubscribe();
  }, [db, userId]);

  useEffect(() => {
    if (db && userId && routines.length > 0 && !isLoading) {
      generateFutureRoutineTasks(routines, tasks);
    }
  }, [routines, tasks.length, isLoading, db, userId]);


  const generateFutureRoutineTasks = async (currentRoutines, currentTasks) => {
    if (!db || !userId) return;

    const DAYS_TO_PLAN = 30;
    const batch = writeBatch(db);
    let operationsCount = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const routine of currentRoutines) {
      if (!routine.startDate) continue;

      const startDate = new Date(routine.startDate);
      startDate.setHours(0, 0, 0, 0);

      for (let i = 0; i < DAYS_TO_PLAN; i++) {
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + i);
        futureDate.setHours(0, 0, 0, 0);

        if (futureDate < startDate) continue;

        if (!routine.frequency.includes(futureDate.getDay())) continue;

        const dateString = futureDate.toDateString();
        const exists = currentTasks.find(t => 
          t.routineId === routine.id && 
          t.dueDate && 
          t.dueDate.toDateString() === dateString
        );

        if (!exists) {
          const newRef = doc(collection(db, 'users', userId, 'tasks'));
          batch.set(newRef, {
            title: routine.title,
            isCompleted: false,
            dueDate: Timestamp.fromDate(futureDate),
            createdAt: serverTimestamp(),
            isRoutine: true,
            routineId: routine.id
          });
          operationsCount++;
        }
      }
    }

    if (operationsCount > 0) {
      try {
        await batch.commit();
      } catch (e) {
        console.error("Error creating routine tasks:", e);
      }
    }
  };

  const addTask = async (title, dateString) => {
    if (!db || !userId) {
      alert("Помилка: База даних не підключена. Спробуйте оновити сторінку.");
      return;
    }
    try {
      let dueDateObj = dateString ? new Date(dateString) : new Date();
      dueDateObj.setHours(0, 0, 0, 0);

      await addDoc(collection(db, 'users', userId, 'tasks'), {
        title,
        isCompleted: false,
        dueDate: Timestamp.fromDate(dueDateObj),
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding task: ", e);
      alert(`Помилка при додаванні: ${e.message}`);
    }
  };

  const addRoutine = async (title, frequency, startDate) => {
    if (!db || !userId) {
      alert("Помилка: Немає з'єднання з базою даних. Перевірте авторизацію.");
      return;
    }

    try {
      await addDoc(collection(db, 'users', userId, 'routines'), {
        title,
        frequency, 
        startDate, 
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error adding routine: ", e);
      alert(`Не вдалося створити рутину: ${e.message}`);
    }
  };

  const updateTask = async (task) => {
    if (!db || !userId) return;
    try {
      const taskRef = doc(db, 'users', userId, 'tasks', task.id);
      await updateDoc(taskRef, {
        title: task.title,
        isCompleted: task.isCompleted,
        dueDate: Timestamp.fromDate(task.dueDate)
      });
    } catch (e) {
      console.error("Error updating task: ", e);
    }
  };

  const deleteTask = async (id) => {
    if (!db || !userId) return;
    try {
      await deleteDoc(doc(db, 'users', userId, 'tasks', id));
    } catch (e) {
      console.error("Error deleting task: ", e);
    }
  };

  const deleteRoutine = async (routineId) => {
    if (!db || !userId) return;
    try {
      // Знаходимо всі майбутні/невиконані завдання цієї рутини
      const q = query(
        collection(db, 'users', userId, 'tasks'),
        where('routineId', '==', routineId),
        where('isCompleted', '==', false)
      );
      
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      // Видаляємо завдання
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Видаляємо саму рутину
      const routineRef = doc(db, 'users', userId, 'routines', routineId);
      batch.delete(routineRef);

      await batch.commit();

    } catch (e) {
      console.error("Error deleting routine: ", e);
      alert(`Помилка видалення: ${e.message}`);
    }
  };

  const loadInitialPlan = async () => {
     const today = new Date();
     await addTask("Моніторити gov.uk", today.toISOString());
  };

  return { 
    tasks, 
    routines,
    isLoading, 
    addTask, 
    addRoutine, 
    updateTask, 
    deleteTask, 
    deleteRoutine,
    loadInitialPlan 
  };
}