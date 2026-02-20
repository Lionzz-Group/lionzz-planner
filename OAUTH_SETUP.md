# 🔐 Налаштування OAuth автентифікації (Discord та GitHub)

## 📋 Передумови

Для роботи OAuth автентифікації потрібно налаштувати провайдерів у Firebase Console.

## 🚀 Крок 1: Налаштування GitHub OAuth

### 1.1 Створення GitHub OAuth App

1. Перейдіть на [GitHub Developer Settings](https://github.com/settings/developers)
2. Натисніть **"New OAuth App"**
3. Заповніть форму:
   - **Application name:** `Lionzz Planner`
   - **Homepage URL:** `http://localhost:5174` (для dev) або ваш production URL
   - **Authorization callback URL:** `https://lionzz-planner.firebaseapp.com/__/auth/handler`
4. Натисніть **"Register application"**
5. Скопіюйте **Client ID** та **Client Secret**

### 1.2 Додавання GitHub в Firebase

1. Відкрийте [Firebase Console](https://console.firebase.google.com/)
2. Виберіть проект `lionzz-planner`
3. Перейдіть в **Authentication** → **Sign-in method**
4. Натисніть на **GitHub**
5. Увімкніть провайдер
6. Вставте **Client ID** та **Client Secret** з GitHub
7. Додайте **Callback URL** з Firebase в GitHub OAuth App:
   - Скопіюйте URL з Firebase (виглядає як `https://lionzz-planner.firebaseapp.com/__/auth/handler`)
   - Вставте його в GitHub OAuth App в поле "Authorization callback URL"
8. Натисніть **"Save"**

## 🎮 Крок 2: Налаштування Discord OAuth

### 2.1 Створення Discord Application

1. Перейдіть на [Discord Developer Portal](https://discord.com/developers/applications)
2. Натисніть **"New Application"**
3. Введіть назву: `Lionzz Planner`
4. Перейдіть в **OAuth2** → **General**
5. Додайте **Redirect URI:**
   - `https://lionzz-planner.firebaseapp.com/__/auth/handler`
6. Скопіюйте **Client ID** та **Client Secret**

### 2.2 Додавання Discord в Firebase

1. У Firebase Console перейдіть в **Authentication** → **Sign-in method**
2. Натисніть **"Add new provider"** → **Discord**
3. Увімкніть провайдер
4. Вставте **Client ID** та **Client Secret** з Discord
5. Натисніть **"Save"**

## ⚙️ Крок 3: Налаштування Authorized Domains

1. У Firebase Console: **Authentication** → **Settings** → **Authorized domains**
2. Переконайтеся, що додані:
   - `localhost` (для розробки)
   - Ваш production домен

## 🧪 Тестування

1. Запустіть додаток: `npm run dev`
2. Натисніть кнопку **"Увійти через GitHub"** або **"Увійти через Discord"**
3. Дозвольте доступ у popup вікні
4. Перевірте, що ви увійшли успішно

## 🔧 Troubleshooting

### Помилка: "auth/unauthorized-domain"
- Перевірте, що домен додано в **Authorized domains** у Firebase

### Помилка: "auth/operation-not-allowed"
- Перевірте, що провайдер увімкнено в Firebase Console

### Помилка: "redirect_uri_mismatch"
- Переконайтеся, що Callback URL в GitHub/Discord точно відповідає URL з Firebase
- URL має бути: `https://lionzz-planner.firebaseapp.com/__/auth/handler`

### Discord не працює
- Перевірте, що використовується правильний Client ID та Secret
- Переконайтеся, що Redirect URI додано в Discord Application

## 📝 Примітки

- Для production змініть URLs на ваші реальні домени
- Client Secret - це конфіденційна інформація, не публікуйте її
- Анонімна автентифікація працює без додаткових налаштувань

