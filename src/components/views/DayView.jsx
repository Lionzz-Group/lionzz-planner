import React, { useState, useMemo } from 'react';
import { TaskItem } from '../TaskItem';

export function DayView({ 
  selectedDate, 
  tasks, 
  onBack, 
  addTask, 
  onToggleComplete, 
  onDelete, 
  onEdit 
}) {
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const { due, completed } = useMemo(() => {
    const dayString = selectedDate.toDateString();
    const tasksForDay = tasks.filter(task => task.dueDate?.toDateString() === dayString);
    const due = tasksForDay.filter(task => !task.isCompleted);
    const completed = tasksForDay.filter(task => task.isCompleted);
    return { due, completed };
  }, [tasks, selectedDate]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, selectedDate.toISOString().split('T')[0]);
    setNewTaskTitle("");
  };

  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg shadow-xl max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg mb-4"
      >
        &lt; Назад до огляду
      </button>

      <h2 className="text-3xl font-bold text-white mb-4">
        {selectedDate.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </h2>

      <form onSubmit={handleAddTask} className="flex gap-4 mb-6">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Нове завдання на цей день..."
          className="flex-grow bg-gray-700 text-white rounded-md p-3 border border-gray-600"
        />
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-md">
          Додати
        </button>
      </form>

      <h3 className="text-xl font-semibold text-indigo-300 mb-3">Завдання ({due.length})</h3>
      <div className="space-y-2 mb-6">
        {due.length > 0 ? (
          due.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        ) : (
          <p className="text-gray-500 italic">На цей день завдань немає.</p>
        )}
      </div>

      {completed.length > 0 && (
        <>
          <h3 className="text-xl font-semibold text-gray-500 mb-3">Виконані ({completed.length})</h3>
          <div className="space-y-2 opacity-60">
            {completed.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}