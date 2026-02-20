# Lionzz Planner

Сучасний веб-додаток для планування завдань з інтеграцією штучного інтелекту. Підтримує тижневий та місячний вигляд календаря, автоматичне генерування планів через AI, рутини та багато іншого.

## Основні можливості

- **Тижневий та місячний вигляд** календаря з навігацією
- **Управління завданнями**: створення, редагування, видалення, відмітка виконання
- **Відстеження прострочених завдань** з виділенням
- **AI-генератор планів** з підтримкою Gemini, OpenAI, Claude та демо-режиму
- **Рутини** — автоматичне створення повторюваних завдань
- **Багатопровайдерна автентифікація**: GitHub, Discord, Google, анонімний вхід
- **Real-time синхронізація** через Firebase Firestore
- **Адаптивний дизайн** для різних пристроїв

## Швидкий старт

### Встановлення залежностей

```bash
npm install
```

### Запуск у режимі розробки

```bash
npm run dev
```

Додаток буде доступний за адресою `http://localhost:5173`

### Збірка для production

```bash
npm run build
```

### Перегляд production збірки

```bash
npm run preview
```

## Технологічний стек

- **React 18** — UI фреймворк
- **Vite** — збірщик та dev сервер
- **Firebase** — Backend (Authentication + Firestore)
- **Tailwind CSS** — стилізація
- **PostCSS** — обробка CSS

## Структура проекту

```
Lionzz_planner/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── index.html
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Налаштування автентифікації

- **GitHub OAuth** — вхід через GitHub акаунт
- **Discord OAuth** — вхід через Discord акаунт
- **Google OAuth** — вхід через Google акаунт
- **Анонімний вхід** — продовжити як гість

Детальна інструкція в [OAUTH_SETUP.md](./OAUTH_SETUP.md)

## AI-генератор планів

Підтримувані провайдери: Gemini (Google), OpenAI (GPT), Claude (Anthropic), Demo (Mock).

1. Натисніть **AI Assistant** у header
2. Виберіть провайдера та введіть API ключ за потреби
3. Опишіть мету та натисніть **Згенерувати План**

## Рутини

Розділ **Аккаунт** → **Додати рутину** — назва, дні тижня, дата початку. Завдання створюються на 30 днів уперед.

## Структура даних в Firebase

**Завдання:** `/users/{userId}/tasks` — title, isCompleted, dueDate, createdAt, isRoutine, routineId

**Рутини:** `/users/{userId}/routines` — title, frequency (дні 0–6), startDate, createdAt

## Тестування

`npm run dev` → увійти → кнопка **Завантажити початковий план** (якщо база порожня).

## Налаштування

Firebase: `src/services/firebaseConfig.js`. Для production використовуйте змінні оточення в `.env.local`.

## Додаткова документація

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- [OAUTH_SETUP.md](./OAUTH_SETUP.md)
- [FIXES_AND_EXPLANATIONS.md](./FIXES_AND_EXPLANATIONS.md)

## Ліцензія

MIT License. Детальніше в [LICENSE](./LICENSE).

## Автор

Lionzz Group


