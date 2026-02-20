import React, { useState, useMemo, useCallback } from 'react';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { useFirestoreTasks } from './hooks/useFirestoreTasks';
import { getStartOfToday } from './utils/dateHelpers';

import { MonthView } from './components/views/MonthView';
import { WeekView } from './components/views/WeekView';
import { DayView } from './components/views/DayView';
import { ProfileView } from './components/views/ProfileView';

import { EditTaskModal } from './components/EditTaskModal';
import { AuthModal } from './components/AuthModal';
import { AddRoutineModal } from './components/AddRoutineModal';
import { AIGeneratorModal } from './components/AIGeneratorModal';

import { TaskItem } from './components/TaskItem';

function App() {
  const { 
    userId, user, isAuthReady, db, 
    signInWithGoogle, signInWithGitHub, signInWithDiscord, signInAnonymously, logout 
  } = useFirebaseAuth();
  
  const { 
    tasks, routines, isLoading, 
    addTask, addRoutine, updateTask, deleteTask, deleteRoutine, 
    loadInitialPlan 
  } = useFirestoreTasks(db, userId);

  const [view, setView] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [editingTask, setEditingTask] = useState(null);
  const [isRoutineModalOpen, setIsRoutineModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const handleToggleComplete = (task) => updateTask({ ...task, isCompleted: !task.isCompleted });
  const handleSaveEdit = (updatedTask) => { updateTask(updatedTask); setEditingTask(null); };
  
  const handleDayClick = (date) => { setSelectedDate(date); setView('day'); };
  const handleBackToOverview = () => setView('week');

  const goToPrevMonth = () => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() - 1)));
  const goToNextMonth = () => setCurrentDate(prev => new Date(prev.setMonth(prev.getMonth() + 1)));
  const goToPrevWeek = () => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() - 7)));
  const goToNextWeek = () => setCurrentDate(prev => new Date(prev.setDate(prev.getDate() + 7)));

  const handleAddRoutine = (title, frequency, startDate) => {
    addRoutine(title, frequency, startDate);
    setIsRoutineModalOpen(false);
  };

  const handleAISave = async (generatedTasks) => {
    setIsAIModalOpen(false);
    const today = new Date();
    
    for (const t of generatedTasks) {
      const taskDate = new Date(today);
      taskDate.setDate(today.getDate() + t.daysOffset);
      await addTask(`[AI] ${t.title}`, taskDate.toISOString());
    }
    alert(`✨ Додано ${generatedTasks.length} завдань у ваш план.`);
  };

  const today = getStartOfToday();
  
  const overdueTasks = useMemo(() => {
    return tasks.filter(task => 
      !task.isCompleted && task.dueDate && task.dueDate < today
    ).sort((a, b) => a.dueDate - b.dueDate);
  }, [tasks, today]);

  const getTasksForDay = useCallback((day) => {
    const dayString = day.toDateString();
    const due = tasks.filter(task => !task.isCompleted && task.dueDate?.toDateString() === dayString);
    const completed = tasks.filter(task => task.isCompleted && task.dueDate?.toDateString() === dayString);
    return { due, completed };
  }, [tasks]);

  if (!isAuthReady) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">Завантаження Lionzz Planner...</div>;
  }

  if (!userId || !user) {
    return (
      <>
        <div className="min-h-screen bg-gray-900"></div>
        <AuthModal 
          onSignInWithGoogle={signInWithGoogle} 
          onSignInWithGitHub={signInWithGitHub} 
          onSignInWithDiscord={signInWithDiscord} 
          onSignInAnonymously={signInAnonymously} 
          isLoading={!isAuthReady} 
        />
      </>
    );
  }

  const getProviderName = () => {
    if (user.isAnonymous) return 'Гість';
    const p = user.providerData?.[0]?.providerId;
    if (p === 'google.com') return 'Google';
    return 'Користувач';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-8 font-inter">
      <div className="max-w-7xl mx-auto">
        
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 cursor-pointer hover:text-indigo-400 transition" onClick={() => setView('week')}>
                Lionzz Planner 🦁
              </h1>
              <button 
                onClick={() => setIsAIModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg hover:shadow-purple-500/30 transition-all transform hover:scale-105 animate-pulse"
              >
                ✨ AI Assistant
              </button>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span>{user.displayName || 'Гість'}</span>
              <span className="text-gray-600">•</span>
              <span>{getProviderName()}</span>
              <button onClick={logout} className="ml-4 text-red-400 hover:text-red-300 text-xs underline">Вийти</button>
            </div>
          </div>
          
          <div className="flex bg-gray-800 p-1 rounded-xl shadow-lg">
            <button 
              onClick={() => setView('profile')} 
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${view === 'profile' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              👤 Аккаунт
            </button>
            <div className="w-px bg-gray-700 my-2 mx-1"></div>
            <button 
              onClick={() => setView('month')} 
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${view === 'month' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Місяць
            </button>
            <button 
              onClick={() => setView('week')} 
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${view === 'week' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
            >
              Тиждень
            </button>
          </div>
        </header>

        {view !== 'profile' && view !== 'day' && overdueTasks.length > 0 && (
          <div className="bg-red-900/20 border border-red-800/50 p-4 rounded-xl shadow-lg mb-8 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-red-300 mb-3 flex items-center gap-2">
              <span>⚠️</span> Прострочені Завдання ({overdueTasks.length})
            </h2>
            <div className="space-y-2">
              {overdueTasks.map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  onToggleComplete={handleToggleComplete} 
                  onDelete={deleteTask} 
                  onEdit={() => setEditingTask(task)} 
                  isOverdue={true} 
                />
              ))}
            </div>
          </div>
        )}
        
        <main className="transition-all duration-300 ease-in-out">
          {isLoading ? (
             <div className="text-center py-20">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
               <p className="text-indigo-400 animate-pulse">Синхронізація з базою даних...</p>
             </div>
          ) : (
            <>
              {view === 'profile' && (
                <ProfileView 
                  user={user} 
                  tasks={tasks} 
                  routines={routines}
                  onToggleComplete={handleToggleComplete}
                  onDelete={deleteTask}
                  onEdit={(task) => setEditingTask(task)}
                  onAddRoutine={() => setIsRoutineModalOpen(true)}
                  onDeleteRoutine={deleteRoutine}
                />
              )}

              {view === 'month' && (
                <MonthView 
                  currentDate={currentDate} 
                  tasks={tasks} 
                  onDateClick={handleDayClick} 
                  onPrevMonth={goToPrevMonth} 
                  onNextMonth={goToNextMonth} 
                />
              )}
              
              {view === 'week' && (
                <WeekView 
                  currentDate={currentDate} 
                  tasks={tasks} 
                  onDayClick={handleDayClick} 
                  onPrevWeek={goToPrevWeek} 
                  onNextWeek={goToNextWeek} 
                  getTasksForDay={getTasksForDay} 
                  onToggleComplete={handleToggleComplete} 
                  onDelete={deleteTask} 
                  onEdit={(task) => setEditingTask(task)} 
                />
              )}
              
              {view === 'day' && (
                <DayView 
                  selectedDate={selectedDate} 
                  tasks={tasks} 
                  onBack={handleBackToOverview} 
                  addTask={addTask} 
                  onToggleComplete={handleToggleComplete} 
                  onDelete={deleteTask} 
                  onEdit={(task) => setEditingTask(task)} 
                />
              )}
            </>
          )}
        </main>
      </div>
      
      {editingTask && (
        <EditTaskModal 
          task={editingTask} 
          onSave={handleSaveEdit} 
          onCancel={() => setEditingTask(null)} 
        />
      )}
      
      {isRoutineModalOpen && (
        <AddRoutineModal 
          onSave={handleAddRoutine} 
          onCancel={() => setIsRoutineModalOpen(false)} 
        />
      )}
      
      {isAIModalOpen && (
        <AIGeneratorModal 
          onSave={handleAISave} 
          onCancel={() => setIsAIModalOpen(false)} 
        />
      )}

    </div>
  );
}

export default App;