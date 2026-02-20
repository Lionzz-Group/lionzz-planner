import React, { useMemo, useState } from 'react';
import { TaskItem } from '../TaskItem.jsx';

export function ProfileView({ 
  user, 
  tasks, 
  routines, 
  onToggleComplete, 
  onDelete, 
  onEdit, 
  onAddRoutine, 
  onDeleteRoutine 
}) {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'history', 'routines'

  // --- Статистика ---
  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.isCompleted).length;
    const active = tasks.filter(t => !t.isCompleted).length;
    const overdue = tasks.filter(t => !t.isCompleted && t.dueDate < new Date().setHours(0,0,0,0)).length;
    const total = tasks.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, active, overdue, total, rate };
  }, [tasks]);

  const completedTasksList = useMemo(() => 
    tasks.filter(t => t.isCompleted).sort((a, b) => b.dueDate - a.dueDate), 
  [tasks]);

  const overdueTasksList = useMemo(() => 
    tasks.filter(t => !t.isCompleted && t.dueDate < new Date().setHours(0,0,0,0)).sort((a, b) => a.dueDate - b.dueDate),
  [tasks]);

  // Отримання назви дня тижня для рутин
  const getFrequencyString = (freq) => {
    if (freq.length === 7) return "Щодня";
    const days = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return freq.map(d => days[d]).join(', ');
  };

  return (
    <div className="bg-gray-900 text-gray-100 max-w-4xl mx-auto">
      
      {/* Картка профілю */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8 shadow-lg flex items-center gap-4 border-l-4 border-indigo-500">
        <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold">
          {user.email ? user.email[0].toUpperCase() : 'G'}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user.displayName || 'Гість'}</h2>
          <p className="text-gray-400">{user.email || 'Анонімний вхід'}</p>
        </div>
      </div>

      {/* Навігація по вкладках */}
      <div className="flex border-b border-gray-700 mb-6">
        <button 
          onClick={() => setActiveTab('stats')}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'stats' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-gray-200'}`}
        >
          📊 Статистика
        </button>
        <button 
          onClick={() => setActiveTab('routines')}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'routines' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-gray-200'}`}
        >
          🔄 Рутини
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'history' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400 hover:text-gray-200'}`}
        >
          📜 Історія
        </button>
      </div>

      {/* Вкладка: Статистика */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
            <div className="text-sm text-gray-400">Виконано</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-400">{stats.active}</div>
            <div className="text-sm text-gray-400">В процесі</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-red-400">{stats.overdue}</div>
            <div className="text-sm text-gray-400">Прострочено</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-indigo-400">{stats.rate}%</div>
            <div className="text-sm text-gray-400">Ефективність</div>
          </div>
        </div>
      )}

      {/* Вкладка: Рутини */}
      {activeTab === 'routines' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-200">Ваші регулярні завдання</h3>
            <button 
              onClick={onAddRoutine}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-semibold"
            >
              + Додати Рутину
            </button>
          </div>

          {routines.length === 0 ? (
            <p className="text-gray-500 text-center py-8 bg-gray-800 rounded-lg">
              У вас немає активних рутин. Додайте завдання, яке повторюється (наприклад, "Спорт щовівторка").
            </p>
          ) : (
            <div className="grid gap-3">
              {routines.map(routine => (
                <div key={routine.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
                  <div>
                    <div className="font-bold text-lg text-indigo-300">{routine.title}</div>
                    <div className="text-sm text-gray-400">
                      Повторення: <span className="text-white">{getFrequencyString(routine.frequency)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onDeleteRoutine(routine.id)}
                    className="text-gray-500 hover:text-red-400 p-2"
                    title="Видалити рутину"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Вкладка: Історія */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {overdueTasksList.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-red-400 mb-2">⚠️ Прострочені</h3>
              <div className="space-y-2">
                {overdueTasksList.map(task => (
                  <TaskItem key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} onEdit={onEdit} isOverdue={true} />
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-bold text-green-400 mb-2">✅ Виконані</h3>
            <div className="space-y-2">
              {completedTasksList.length > 0 ? (
                completedTasksList.map(task => (
                   <TaskItem key={task.id} task={task} onToggleComplete={onToggleComplete} onDelete={onDelete} onEdit={onEdit} />
                ))
              ) : (
                <p className="text-gray-500">Історія виконаних завдань порожня.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}