# Poll Bot

Бот для создания и управления опросами в Telegram.

## Предварительные требования

Аккаунт Telegram и токен бота от [@BotFather](https://t.me/botfather).

## Настройка переменных окружения

Создайте файлы .env.development и .env в корне проекта:

```
NODE_ENV=

BOT_TOKEN=

SHUFFLE_MID_CHAT_ID=
SHUFFLE_PRO_CHAT_ID=

ADMIN_USER_IDS=
```

## Запуск

### Режим разработки (с авто-перезагрузкой)

```bash
npm run dev
```

### Продакшен-режим локально

```bash
npm run start:prod
```

### Сборка TypeScript

```bash
npm run build
```

### Запуск собранного проекта

```bash
npm start
```

## Разные окружения

Development (NODE_ENV=development):

- Бот использует Polling.
- Все настройки загружаются из файла .env.development.

Production (NODE_ENV=production):

- Бот использует Webhook. Для этого в настройках обязательно должен быть указан корректный PUBLIC_URL.
- Все настройки загружаются из файла .env.

## Технологии

- Node.js + TypeScript — серверная часть.
- node-telegram-bot-api — работа с Telegram Bot API.
- Express — веб-сервер для обработки вебхуков.
- dotenv — управление переменными окружения.
- nodemon — автоматическая перезагрузка при разработке.

Ссылка на бот: https://poll-bot-galdenysh.amvera.io/
