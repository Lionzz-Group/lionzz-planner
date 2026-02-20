import React from 'react';
import { getMonthGrid } from '../../utils/dateHelpers';

export function MonthView({ currentDate, onDateClick, onPrevMonth, onNextMonth, tasks }) {
  const days = getMonthGrid(currentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getTasksForDay = (day) => {
    const dayString = day.toDateString();
    return tasks.filter(task => task.dueDate?.toDateString() === dayString).length;
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onPrevMonth} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
          &lt;
        </button>
        <h2 className="text-xl md:text-2xl font-semibold text-center text-white">
          {currentDate.toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={onNextMonth} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
          &gt;
        </button>
      </div>
      
      {/* Заголовки днів тижня */}
      <div className="grid grid-cols-7 gap-2 mb-2 text-center text-gray-400 text-sm">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map(day => (
          <div key={day} className="font-semibold">{day}</div>
        ))}
      </div>

      {/* Сітка календаря */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const taskCount = getTasksForDay(day.date);
          const isCurrent = day.date.toDateString() === today.toDateString();
          
          return (
            <div
              key={index}
              className={`
                p-2 h-24 rounded-lg cursor-pointer transition-all duration-150
                ${day.isCurrentMonth ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 opacity-30 hover:bg-gray-700'}
                ${isCurrent ? 'border-2 border-indigo-500' : 'border border-gray-900'}
              `}
              onClick={() => onDateClick(day.date)}
            >
              <span className={`font-bold ${isCurrent ? 'text-indigo-300' : 'text-white'}`}>
                {day.date.getDate()}
              </span>
              {taskCount > 0 && (
                <div className="mt-2 text-xs text-center text-white bg-indigo-500 bg-opacity-70 rounded-full w-5 h-5 flex items-center justify-center">
                  {taskCount}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}