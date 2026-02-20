import React, { useState } from 'react';

export function AddRoutineModal({ onSave, onCancel }) {
  const [title, setTitle] = useState('');
  // За замовчуванням стартова дата - сьогодні
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDays, setSelectedDays] = useState([]);

  const days = [
    { id: 1, label: 'Пн' },
    { id: 2, label: 'Вт' },
    { id: 3, label: 'Ср' },
    { id: 4, label: 'Чт' },
    { id: 5, label: 'Пт' },
    { id: 6, label: 'Сб' },
    { id: 0, label: 'Нд' },
  ];

  const toggleDay = (dayId) => {
    if (selectedDays.includes(dayId)) {
      setSelectedDays(selectedDays.filter(d => d !== dayId));
    } else {
      setSelectedDays([...selectedDays, dayId].sort());
    }
  };

  const handleSave = () => {
    if (!title.trim() || selectedDays.length === 0 || !startDate) return;
    onSave(title, selectedDays, startDate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 text-white">Нова Рутина</h3>
        
        <div className="mb-4">
          <label className="block text-gray-400 mb-2 text-sm">Назва рутини</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Напр: Читати 15 хв"
            className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-400 mb-2 text-sm">Дата початку</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-md p-3 border border-gray-600 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-400 mb-2 text-sm">Дні повторення</label>
          <div className="flex justify-between gap-1">
            {days.map(day => (
              <button
                key={day.id}
                onClick={() => toggleDay(day.id)}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${selectedDays.includes(day.id) 
                    ? 'bg-indigo-600 text-white transform scale-110' 
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}
                `}
              >
                {day.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Завдання будуть заплановані на 30 днів вперед.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">
            Скасувати
          </button>
          <button 
            onClick={handleSave}
            disabled={!title || selectedDays.length === 0 || !startDate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Створити
          </button>
        </div>
      </div>
    </div>
  );
}