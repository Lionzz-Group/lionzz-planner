import React from 'react';
import { TaskItem } from './TaskItem';

export function DayCard({ date, isToday, dueTasks, completedTasks, onToggleComplete, onDelete, onEdit, onDayClick }) {
  const dayName = date.toLocaleDateString('uk-UA', { weekday: 'short' });
  const dayNum = date.getDate();

  return (
    // 3. Викликаємо функцію при кліку. Додав перевірку (onDayClick && ...), щоб не було помилок
    <div 
      onClick={() => onDayClick && onDayClick(date)}
      className={`
        rounded-lg shadow-lg p-4 cursor-pointer transition-all duration-150 group
        ${isToday ? 'bg-gray-700 border-2 border-indigo-500' : 'bg-gray-800 hover:bg-gray-700'}
      `}
    >
      <div className={`flex justify-between items-center mb-3 ${isToday ? 'text-indigo-300' : 'text-gray-400'}`}>
        <span className="font-bold text-lg uppercase">{dayName}</span>
        <span className="font-bold text-2xl">{dayNum}</span>
      </div>
      
      {/* Компактний вигляд */}
      <div className="mt-2 space-y-1">
        {dueTasks.length > 0 && (
          <div className="text-sm text-white bg-indigo-600 py-1 px-2 rounded-md inline-block">
            {dueTasks.length} {dueTasks.length === 1 ? 'завдання' : 'завдань'}
          </div>
        )}
        
        {completedTasks.length > 0 && (
          <div className="text-sm text-gray-500 line-through block">
            {completedTasks.length} {completedTasks.length === 1 ? 'виконано' : 'виконаних'}
          </div>
        )}

        {dueTasks.length === 0 && completedTasks.length === 0 && (
           <div className="text-gray-600 text-sm italic pt-2">
             Вільно
           </div>
        )}
      </div>
      
      <div className="mt-3 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity text-center">
        Натисніть, щоб відкрити
      </div>
    </div>
  );
}