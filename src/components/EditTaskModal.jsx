import React, { useState } from 'react';

export function EditTaskModal({ task, onSave, onCancel }) {
  const [title, setTitle] = useState(task.title);
  const [dueDateString, setDueDateString] = useState(task.dueDate.toISOString().split('T')[0]);

  const handleSave = () => {
    const newDueDate = new Date(dueDateString);
    newDueDate.setHours(23, 59, 59);
    
    onSave({
      ...task,
      title: title,
      dueDate: newDueDate,
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()} // Зупиняємо "спливання" кліку
      >
        <h3 className="text-2xl font-bold mb-4">Редагувати Завдання</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="date"
            value={dueDateString}
            onChange={(e) => setDueDateString(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200"
          >
            Скасувати
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition-all duration-200"
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
}