import React, { useMemo } from 'react';
import { getStartOfWeek } from '../../utils/dateHelpers';
import { DayCard } from '../DayCard';

export function WeekView({ 
  currentDate, 
  tasks, 
  onDayClick, 
  onPrevWeek, 
  onNextWeek, 
  getTasksForDay,
  onToggleComplete,
  onDelete,
  onEdit
}) {

  const weekDays = useMemo(() => {
    const start = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [currentDate]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onPrevWeek} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
          &lt; Попередній
        </button>
        <h2 className="text-xl md:text-2xl font-semibold text-center text-white">
          {weekDays[0].toLocaleDateString('uk-UA', { month: 'long', day: 'numeric' })}
          {' - '}
          {weekDays[6].toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={onNextWeek} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
          Наступний &gt;
        </button>
      </div>
      
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
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onDayClick={() => onDayClick(day)} 
            />
          );
        })}
      </div>
    </div>
  );
}