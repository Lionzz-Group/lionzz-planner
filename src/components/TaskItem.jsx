import React from 'react';

export function TaskItem({ task, onToggleComplete, onDelete, onEdit, isOverdue = false }) {
  // Форматуємо дату для відображення
  const dateString = task.dueDate 
    ? task.dueDate.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }) 
    : '';

  return (
    <div 
      className={`
        flex items-center justify-between p-3 rounded-md group border border-transparent
        ${isOverdue ? 'bg-red-900/40 border-red-800/50' : 'bg-gray-700 hover:bg-gray-600'}
        ${task.isCompleted ? 'opacity-60 bg-gray-800' : ''}
        transition-all duration-150
      `}
    >
      <div className="flex items-center gap-3 overflow-hidden flex-grow">
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={(e) => { e.stopPropagation(); onToggleComplete(task); }}
          className="form-checkbox h-5 w-5 text-green-500 bg-gray-600 border-gray-500 rounded focus:ring-green-500 flex-shrink-0 cursor-pointer"
        />
        
        <div className="flex flex-col overflow-hidden">
          <span 
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className={`
              cursor-pointer truncate font-medium
              ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-100'}
              ${isOverdue && !task.isCompleted ? 'text-red-200' : ''}
            `}
          >
            {task.title}
          </span>
          
          {/* Відображаємо дату, якщо завдання прострочене, виконане або це рутина */}
          {(isOverdue || task.isCompleted || task.isRoutine) && (
             <span className={`text-xs ${isOverdue ? 'text-red-300' : 'text-gray-500'}`}>
               {task.isRoutine && <span className="text-indigo-300 mr-1">⟳ Рутина •</span>}
               {isOverdue ? `Прострочено: ${dateString}` : `Дата: ${dateString}`}
             </span>
          )}
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 px-2"
      >
        &times;
      </button>
    </div>
  );
}