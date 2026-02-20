import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, collection, doc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, Timestamp, setLogLevel } from 'firebase/firestore';

// --- Firebase Configuration ---
// These global variables are provided by the environment.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' 
  ? JSON.parse(__firebase_config) 
  : { apiKey: "YOUR_FALLBACK_API_KEY", authDomain: "...", projectId: "..." };
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// --- Helper Functions ---

/**
 * Gets the start of the week (Monday) for a given date.
 * @param {Date} date 
 * @returns {Date}
 */
const getStartOfWeek = (date) => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday (0)
  return new Date(newDate.setDate(diff));
};

/**
 * Gets the start of today.
 * @returns {Date}
 */
const getStartOfToday = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
};

// --- Main App Component ---

function App() {
  // --- Firebase State ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // --- App State ---
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date()); // Used to anchor the week view
  const [isLoading, setIsLoading] = useState(true);
  
  // --- Form/Modal State ---
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingTask, setEditingTask] = useState(null); // { id, title, dueDate }

  // --- Firebase Initialization Effect ---
  useEffect(() => {
    try {
      const app = initializeApp(firebaseConfig);
      const firestoreDb = getFirestore(app);
      const firebaseAuth = getAuth(app);
      
      setDb(firestoreDb);
      setAuth(firebaseAuth);
      setLogLevel('Debug'); // Enable Firestore logging

      // Set persistence
      setPersistence(firebaseAuth, browserLocalPersistence)
        .then(() => {
          // Auth listener
          const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
              setUserId(user.uid);
            } else {
              // No user, try to sign in
              try {
                if (initialAuthToken) {
                  await signInWithCustomToken(firebaseAuth, initialAuthToken);
                } else {
                  await signInAnonymously(firebaseAuth);
                }
              } catch (authError) {
                console.error("Error signing in:", authError);
              }
            }
            setIsAuthReady(true); // Now we are ready, whether signed in or not (though we should be)
          });
          return unsubscribe;
        })
        .catch((error) => {
          console.error("Error setting persistence:", error);
          setIsAuthReady(true); // Still ready, but with potential issues
        });

    } catch (e) {
      console.error("Error initializing Firebase:", e);
      setIsAuthReady(true); // Mark as ready even on error to not block UI
    }
  }, []);

  // --- Firestore Data Subscription Effect ---
  useEffect(() => {
    if (!isAuthReady || !db || !userId) {
      // Wait for auth and DB to be ready
      return;
    }

    setIsLoading(true);
    const tasksColPath = `artifacts/${appId}/users/${userId}/tasks`;
    const tasksCollection = collection(db, tasksColPath);
    const q = query(tasksCollection);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamps back to JS Dates
          dueDate: data.dueDate?.toDate(),
          createdAt: data.createdAt?.toDate(),
        };
      });
      setTasks(fetchedTasks);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();

  }, [isAuthReady, db, userId, appId]); // Depend on auth readiness

  // --- CRUD Functions ---

  const getTasksCol = useCallback(() => {
    if (!db || !userId) return null;
    return collection(db, `artifacts/${appId}/users/${userId}/tasks`);
  }, [db, userId, appId]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDate) return;
    
    const tasksCol = getTasksCol();
    if (!tasksCol) return;

    try {
      const dueDateTime = new Date(newTaskDate);
      dueDateTime.setHours(23, 59, 59); // Set to end of day
      
      await addDoc(tasksCol, {
        title: newTaskTitle.trim(),
        isCompleted: false,
        dueDate: Timestamp.fromDate(dueDateTime),
        createdAt: Timestamp.now(),
      });
      setNewTaskTitle("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleUpdateTask = async (task) => {
    const tasksCol = getTasksCol();
    if (!tasksCol) return;

    const taskRef = doc(db, `artifacts/${appId}/users/${userId}/tasks`, task.id);
    
    // Convert JS Date back to Firestore Timestamp if it exists
    const updatedData = { ...task };
    delete updatedData.id; // Don't save ID inside the document
    if (updatedData.dueDate && updatedData.dueDate instanceof Date) {
      updatedData.dueDate = Timestamp.fromDate(updatedData.dueDate);
    }
    if (updatedData.createdAt && updatedData.createdAt instanceof Date) {
        updatedData.createdAt = Timestamp.fromDate(updatedData.createdAt);
    }

    try {
      await updateDoc(taskRef, updatedData);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleToggleComplete = (task) => {
    handleUpdateTask({ ...task, isCompleted: !task.isCompleted });
  };
  
  const handleDeleteTask = async (taskId) => {
    const tasksCol = getTasksCol();
    if (!tasksCol) return;

    try {
      await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/tasks`, taskId));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleSaveEdit = () => {
    if (!editingTask) return;
    
    // Convert date string from local input back to Date object
    const newDueDate = new Date(editingTask.dueDateString);
    newDueDate.setHours(23, 59, 59);

    handleUpdateTask({
      id: editingTask.id,
      title: editingTask.title,
      isCompleted: editingTask.isCompleted,
      createdAt: editingTask.createdAt,
      dueDate: newDueDate,
    });
    setEditingTask(null);
  };

  const openEditModal = (task) => {
    setEditingTask({
      ...task,
      // Store date as string for the input[type="date"]
      dueDateString: task.dueDate.toISOString().split('T')[0],
    });
  };

  // --- Memoized Task Filtering ---

  const today = getStartOfToday();

  // Find all *uncompleted* tasks from before today
  const overdueTasks = useMemo(() => {
    return tasks.filter(task => 
      !task.isCompleted && task.dueDate && task.dueDate < today
    ).sort((a, b) => a.dueDate - b.dueDate);
  }, [tasks, today]);

  // Generate 7 days for the current week view
  const weekDays = useMemo(() => {
    const start = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [currentDate]);

  /**
   * Memoized function to get tasks for a specific day.
   */
  const getTasksForDay = useCallback((day) => {
    const dayString = day.toDateString();
    
    const due = tasks.filter(task => 
      !task.isCompleted && 
      task.dueDate && 
      task.dueDate.toDateString() === dayString
    );
    
    const completed = tasks.filter(task => 
      task.isCompleted && 
      task.dueDate && 
      task.dueDate.toDateString() === dayString
    );
    
    return { due, completed };
  }, [tasks]);


  // --- Week Navigation ---
  
  const goToPreviousWeek = () => {
    setCurrentDate(prev => new Date(prev.setDate(prev.getDate() - 7)));
  };

  const goToNextWeek = () => {
    setCurrentDate(prev => new Date(prev.setDate(prev.getDate() + 7)));
  };

  // --- Initial Plan Loader ---
  const loadInitialPlan = async () => {
    if (tasks.length > 0) {
      console.log("Tasks already exist, not loading initial plan.");
      return;
    }
    
    const tasksCol = getTasksCol();
    if (!tasksCol) return;

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59);

    const midWeek = new Date(todayEnd);
    midWeek.setDate(midWeek.getDate() + 2);
    
    const endOfWeek = new Date(todayEnd);
    endOfWeek.setDate(endOfWeek.getDate() + 4);

    const initialPlan = [
      // --- Daily Tasks (due today) ---
      { title: "Моніторити gov.uk та Multiverse на нові стажування", dueDate: Timestamp.fromDate(todayEnd), isDaily: true },
      { title: "Розвивати LinkedIn: 15 хв (коннекти, пости)", dueDate: Timestamp.fromDate(todayEnd), isDaily: true },
      
      // --- One-time Tasks (staggered) ---
      { title: "[Tech] Отримати OpenAI API ключ", dueDate: Timestamp.fromDate(todayEnd) },
      { title: "[Brand] Оновити CV та LinkedIn, додавши 'AI Specialist'", dueDate: Timestamp.fromDate(todayEnd) },
      { title: "[Portfolio] Створити репозиторій на GitHub для ШІ-проектів", dueDate: Timestamp.fromDate(todayEnd) },
      { title: "[Tech] Почати вивчення Prompt Engineering (базові техніки)", dueDate: Timestamp.fromDate(midWeek) },
      { title: "[Tech] Ознайомитися з Claude API (документація)", dueDate: Timestamp.fromDate(midWeek) },
      { title: "[Tech] Вивчити, що таке PRD (Product Requirements Document)", dueDate: Timestamp.fromDate(endOfWeek) },
      { title: "[Portfolio] Почати перший ШІ-проект (напр., простий суммаризатор)", dueDate: Timestamp.fromDate(endOfWeek) },
    ];

    try {
      for (const task of initialPlan) {
        await addDoc(tasksCol, {
          ...task,
          isCompleted: false,
          createdAt: Timestamp.now(),
        });
      }
      console.log("Initial plan loaded!");
    } catch (error) {
      console.error("Error loading initial plan:", error);
    }
  };

  // --- Render ---

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-2xl">Автентифікація...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-0">
            Мій План Розвитку AI
          </h1>
          {tasks.length === 0 && !isLoading && (
            <button
              onClick={loadInitialPlan}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
            >
              Завантажити початковий план
            </button>
          )}
        </header>

        {/* --- Add New Task Form --- */}
        <form onSubmit={handleAddTask} className="bg-gray-800 p-4 rounded-lg shadow-xl mb-8 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Нове завдання..."
            className="flex-grow bg-gray-700 text-white rounded-md p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            className="bg-gray-700 text-white rounded-md p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md shadow-md transition-all duration-200"
          >
            Додати
          </button>
        </form>

        {/* --- Overdue Tasks Section (Penalty Box) --- */}
        {overdueTasks.length > 0 && (
          <div className="bg-red-900 bg-opacity-50 border border-red-700 p-4 rounded-lg shadow-xl mb-8">
            <h2 className="text-2xl font-bold text-red-300 mb-3">
              Прострочені Завдання (Штрафні)
            </h2>
            <div className="space-y-2">
              {overdueTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  onEdit={openEditModal}
                  isOverdue={true}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* --- Week View --- */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPreviousWeek}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
          >
            &lt; Попередній тиждень
          </button>
          <h2 className="text-xl md:text-2xl font-semibold text-center">
            {weekDays[0].toLocaleDateString('uk-UA', { month: 'long', day: 'numeric' })}
            {' - '}
            {weekDays[6].toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={goToNextWeek}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
          >
            Наступний тиждень &gt;
          </button>
        </div>

        {isLoading ? (
          <div className="text-center text-xl p-10">Завантаження завдань...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {weekDays.map(day => {
              const { due, completed } = getTasksForDay(day);
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <DayCard 
                  key={day.toISOString()} 
                  date={day} 
                  isToday={isToday}
                  dueTasks={due} 
                  completedTasks={completed}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                  onEdit={openEditModal}
                />
              );
            })}
          </div>
        )}

      </div>
      
      {/* --- Edit Task Modal --- */}
      {editingTask && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setEditingTask(null)}
        >
          <div 
            className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()} // Prevent closing on click inside
          >
            <h3 className="text-2xl font-bold mb-4">Редагувати Завдання</h3>
            <div className="space-y-4">
              <input
                type="text"
                value={editingTask.title}
                onChange={(e) => setEditingTask(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="date"
                value={editingTask.dueDateString}
                onChange={(e) => setEditingTask(prev => ({ ...prev, dueDateString: e.target.value }))}
                className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setEditingTask(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200"
              >
                Скасувати
              </button>
              <button
                onClick={handleSaveEdit}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200"
              >
                Зберегти
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- DayCard Component ---
function DayCard({ date, isToday, dueTasks, completedTasks, onToggleComplete, onDelete, onEdit }) {
  const dayName = date.toLocaleDateString('uk-UA', { weekday: 'short' });
  const dayNum = date.getDate();

  return (
    <div className={`rounded-lg shadow-lg p-4 ${isToday ? 'bg-gray-700 border-2 border-indigo-500' : 'bg-gray-800'}`}>
      <div className={`flex justify-between items-center mb-3 ${isToday ? 'text-indigo-300' : 'text-gray-400'}`}>
        <span className="font-bold text-lg">{dayName}</span>
        <span className="font-bold text-2xl">{dayNum}</span>
      </div>
      
      <div className="space-y-2">
        {/* Due Tasks */}
        {dueTasks.map(task => (
          <TaskItem 
            key={task.id} 
            task={task} 
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
        
        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="opacity-50 pt-2 border-t border-gray-700">
            {completedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        )}

        {dueTasks.length === 0 && completedTasks.length === 0 && (
           <div className="text-gray-500 text-sm italic text-center pt-2">
             Вільно
           </div>
        )}
      </div>
    </div>
  );
}

// --- TaskItem Component ---
function TaskItem({ task, onToggleComplete, onDelete, onEdit, isOverdue = false }) {
  return (
    <div 
      className={`
        flex items-center justify-between p-2 rounded-md group
        ${isOverdue ? 'bg-red-800 bg-opacity-50' : 'bg-gray-700 hover:bg-gray-600'}
        ${task.isCompleted ? 'opacity-60' : ''}
        transition-all duration-150
      `}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={() => onToggleComplete(task)}
          className="form-checkbox h-5 w-5 text-green-500 bg-gray-600 border-gray-500 rounded focus:ring-green-500"
        />
        <span 
          onClick={() => onEdit(task)}
          className={`
            cursor-pointer truncate
            ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-100'}
            ${isOverdue ? 'text-red-100' : ''}
          `}
        >
          {task.title}
        </span>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-lg"
      >
        &times;
      </button>
    </div>
  );
}

export default App;