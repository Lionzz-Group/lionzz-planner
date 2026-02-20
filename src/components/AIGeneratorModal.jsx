import React, { useState, useEffect } from 'react';
import { generatePlanFromGoal } from '../services/ai';

const LLM_PROVIDERS = [
  { id: 'gemini', name: 'Gemini (Google)', icon: '✨', placeholder: 'AIza...', isPaid: false },
  { id: 'openai', name: 'OpenAI (GPT)', icon: '🧠', placeholder: 'sk-...', isPaid: true },
  { id: 'claude', name: 'Claude (Anthropic)', icon: ' Claude', placeholder: 'sk-ant-...', isPaid: true },
  { id: 'mock', name: 'Demo (Mock)', icon: '💡', placeholder: 'Не потрібен', isPaid: false },
];

const LOCAL_STORAGE_KEY_PREFIX = 'ai_key_';

export function AIGeneratorModal({ onSave, onCancel }) {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + selectedProvider);
      if (storedKey) {
        setApiKey(storedKey);
      } else {
        setApiKey(''); 
      }
    } catch (e) {
      console.error("Error loading API key from localStorage:", e);
    }
  }, [selectedProvider]);

  const handleKeyChange = (e) => {
    const newKey = e.target.value;
    setApiKey(newKey);
    try {
      if (selectedProvider !== 'mock') {
        localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + selectedProvider, newKey);
      }
    } catch (e) {
      console.error("Error saving API key to localStorage:", e);
    }
  };

  const handleGenerate = async () => {
    if (!goal.trim()) {
      setError("Будь ласка, введіть вашу мету.");
      return;
    }
    
    if (selectedProvider !== 'mock' && !apiKey.trim()) {
        setError(`Будь ласка, введіть API ключ для ${selectedProvider.toUpperCase()}.`);
        return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const tasks = await generatePlanFromGoal(goal, apiKey, selectedProvider);
      onSave(tasks); 
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Сталася помилка при генерації плану. Перевірте ключ API.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentProvider = LLM_PROVIDERS.find(p => p.id === selectedProvider) || LLM_PROVIDERS[0];
  const providerPlaceholder = currentProvider.placeholder;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-lg border border-purple-500/30" onClick={e => e.stopPropagation()}>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-xl">✨</div>
          <h3 className="text-2xl font-bold text-white">AI Планувальник</h3>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-3 rounded-lg mb-4 text-sm border border-red-800">
            {error}
          </div>
        )}
        
        <div className="mb-6 space-y-4">
          <div className="flex justify-around items-center bg-gray-900/50 p-2 rounded-xl border border-gray-700 space-x-2">
            {LLM_PROVIDERS.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p.id)}
                className={`flex flex-col items-center p-2 rounded-lg text-sm font-medium transition-colors w-full
                  ${selectedProvider === p.id 
                    ? 'bg-purple-700/50 text-white shadow-md border border-purple-500' 
                    : 'text-gray-400 hover:bg-gray-700'}
                `}
              >
                <span className={`text-xl mb-1 ${p.id === 'gemini' ? 'text-yellow-400' : ''}`}>{p.icon}</span>
                {p.name}
              </button>
            ))}
          </div>

          {selectedProvider !== 'mock' && (
            <div className="p-3 bg-gray-900 rounded-lg">
              <label className="block text-gray-400 mb-2 text-sm font-medium">
                {currentProvider.name} API Key (зберігається локально)
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={handleKeyChange}
                placeholder={providerPlaceholder}
                className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none font-mono"
              />
              <p className="text-xs text-gray-500 mt-2">
                * Використовуйте Demo (Mock) режим, якщо у вас немає ключа.
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-purple-300 mb-2 text-sm font-medium">Яка ваша мета?</label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Напр: Створити портфоліо на React за 2 тижні..."
              className="w-full bg-gray-900 text-white rounded-lg p-4 border border-gray-700 focus:ring-2 focus:ring-purple-500 outline-none h-32 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 items-center">
          <button 
            onClick={onCancel} 
            className="text-gray-400 hover:text-white px-4 py-2 transition-colors"
            disabled={isLoading}
          >
            Скасувати
          </button>
          
          <button 
            onClick={handleGenerate}
            disabled={!goal.trim() || isLoading}
            className={`
              bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 
              text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-purple-900/20
              flex items-center gap-2
              ${isLoading ? 'opacity-70 cursor-wait' : ''}
            `}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Думаю...
              </>
            ) : (
              <>
                <span>Згенерувати План</span>
                <span>🪄</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}