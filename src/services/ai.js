/**
 * AI Plan Generator Service
 * Routes requests to different LLM providers or uses mock generation.
 * 
 * @param {string} goal - User's goal
 * @param {string} apiKey - API key for the selected provider
 * @param {string} provider - Provider ID ('openai', 'gemini', 'claude', 'mock')
 * @returns {Promise<Array<{title: string, daysOffset: number}>>} Generated plan
 */
export const generatePlanFromGoal = async (goal, apiKey, provider) => {
  if (provider === 'mock') {
    return runMockGeneration(goal);
  }

  if (!apiKey) {
    throw new Error(`API ключ для ${provider.toUpperCase()} не надано.`);
  }
  
  switch (provider) {
    case 'openai':
      return runOpenAIGeneration(goal, apiKey); 
    case 'gemini':
      return runGeminiGeneration(goal, apiKey);
    case 'claude':
      return runClaudeGeneration(goal, apiKey);
    default:
      throw new Error(`Незрозумілий провайдер: ${provider}`);
  }
};

const runMockGeneration = (goal) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const keywords = goal.toLowerCase().split(' ');
      const topic = keywords.length > 2 ? `${keywords[0]} ${keywords[1]}...` : goal;

      const plan = [
        { title: `📚 Дослідити ${topic} (Основи)`, daysOffset: 0 },
        { title: `🛠 Налаштувати оточення та залежності`, daysOffset: 1 },
        { title: `📝 Скласти структуру проекту`, daysOffset: 2 },
        { title: `💻 Перша практична реалізація ${topic}`, daysOffset: 4 },
        { title: `👀 Аналіз прогресу та коригування плану`, daysOffset: 6 },
        { title: `🏁 Фінальний огляд і запуск`, daysOffset: 8 },
      ];
      resolve(plan);
    }, 1500);
  });
};

const runGeminiGeneration = async (goal, apiKey) => {
  const model = "gemini-2.5-flash-preview-09-2025"; 
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const prompt = `Я хочу досягти цілі: "${goal}". Ти професійний планувальник завдань. Розбий цю ціль на 5-8 конкретних, коротких, послідовних завдань. Кожне завдання повинно мати назву та зміщення у днях від сьогодні (daysOffset). Мова відповіді: Українська.`;
  
  const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
              type: "ARRAY",
              description: "JSON array of task objects.",
              items: {
                  type: "OBJECT",
                  properties: {
                      title: { type: "STRING", description: "Назва завдання." },
                      daysOffset: { type: "NUMBER", description: "Зміщення у днях від сьогодні (0 - сьогодні, 1 - завтра)." }
                  },
                  required: ["title", "daysOffset"]
              }
          }
      },
  };

  try {
      const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Gemini API помилка: ${errorData.error.message || response.statusText}`);
      }

      const result = await response.json();
      const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!jsonText) {
          throw new Error("Gemini не повернув структурований JSON.");
      }

      const parsedJson = JSON.parse(jsonText);
      return parsedJson;

  } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error(`Не вдалося отримати план від Gemini: ${error.message}`);
  }
};

const runOpenAIGeneration = async (goal, apiKey) => {
  throw new Error("Реальний API запит до OpenAI не реалізовано. Використовуйте Demo (Mock) або Gemini.");
};

const runClaudeGeneration = async (goal, apiKey) => {
  throw new Error("Реальний API запит до Claude не реалізовано. Використовуйте Demo (Mock) або Gemini.");
};