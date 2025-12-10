import TelegramBot from "node-telegram-bot-api";
import * as dotenv from "dotenv";
import express from "express";
import {
  CREATE_MID_POLL_KEY,
  CREATE_MID_POLL_KEY_ID,
  CREATE_PRO_POLL_KEY,
  CREATE_PRO_POLL_KEY_ID,
  PORT,
  PUBLIC_URL,
  TEST_KEY,
  TEST_KEY_ID,
} from "./constants.js";
import { createPollMsg, isUserAdmin } from "./utils.js";

const nodeEnv = process.env.NODE_ENV || "production";
const isProduction = process.env.NODE_ENV === "production";
const envFile = isProduction ? ".env" : ".env.development";

dotenv.config({ path: envFile });

console.log(`✅ Режим: ${nodeEnv}`);

const token = process.env.BOT_TOKEN || "";
const SHUFFLE_MID_CHAT_ID = process.env.SHUFFLE_MID_CHAT_ID;
const SHUFFLE_PRO_CHAT_ID = process.env.SHUFFLE_PRO_CHAT_ID;
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS ? process.env.ADMIN_USER_IDS.split(",").map(Number) : [];

if (!token) {
  console.error("❌ Ошибка: токен бота не найден. Убедитесь, что файл .env создан и заполнен.");
  process.exit(1);
}

const bot = new TelegramBot(token);

if (isProduction) {
  const app = express();

  app.use(express.json());

  app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  });

  app.listen(PORT, async () => {
    console.log(`🚀 Сервер бота запущен на порту ${PORT}`);
    console.log(`🌐 Webhook URL: ${PUBLIC_URL}/bot${token.substring(0, 10)}...`);

    try {
      await bot.setWebHook(`${PUBLIC_URL}/bot${token}`);

      console.log("✅ Webhook успешно установлен");
    } catch (error) {
      console.error("❌ Ошибка установки Webhook:", error);
    }
  });
} else {
  bot.startPolling();

  console.log("🧪 Бот запущен в режиме Polling (разработка)");
}

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const pollKeyboard = {
    keyboard: [[{ text: "/poll" }]],
    resize_keyboard: true,
    one_time_keyboard: false,
    is_persistent: true,
  };

  bot.sendMessage(
    chatId,
    `🎛️ *Панель управления ботом*

    Доступные команды:
    - /poll - создать опрос в чате.
    `,
    {
      parse_mode: "Markdown",
      reply_markup: pollKeyboard,
    }
  );
});

// Обработчик команды /test
bot.onText(/\/test/, (msg) => {
  const chatId = msg.chat.id;

  const keyboard = {
    inline_keyboard: [[{ text: TEST_KEY, callback_data: TEST_KEY_ID }]],
  };

  bot.sendMessage(chatId, "Это тестовое сообщение. Нажмите кнопку ниже:", {
    reply_markup: keyboard,
  });
});

// Обработчик команды /poll
bot.onText(/\/poll/, (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    inline_keyboard: [
      [
        {
          text: CREATE_MID_POLL_KEY,
          callback_data: CREATE_MID_POLL_KEY_ID,
        },
      ],
      [
        {
          text: CREATE_PRO_POLL_KEY,
          callback_data: CREATE_PRO_POLL_KEY_ID,
        },
      ],
    ],
  };

  bot.sendMessage(chatId, "Нажмите кнопку ниже, чтобы отправить опрос в чат:", {
    reply_markup: keyboard,
  });
});

// Обработчик нажатий
bot.on("callback_query", async (callbackQuery) => {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message?.chat.id;
  const messageId = callbackQuery.message?.message_id;
  const data = callbackQuery.data;

  const options = {
    chat_id: chatId,
    message_id: messageId,
  };

  // Проверка доступа
  if (!isUserAdmin(userId, ADMIN_USER_IDS)) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: "⛔ У вас нет прав на управление ботом.",
      show_alert: true,
    });

    console.log(`Пользователь "${userId}" хочет получить доступ`);

    return;
  }

  // Даём ответ Telegram, чтобы убрать loading
  bot.answerCallbackQuery(callbackQuery.id);

  if (chatId && data === TEST_KEY_ID) {
    console.log(`Кнопка нажата "${TEST_KEY}" в чате ${chatId}`);

    // Меняем текст сообщения, к которому была прикреплена кнопка
    bot.editMessageText("✅ Отлично! Кнопка сработала. Логика работает.", options);
  }

  if (chatId && data === CREATE_MID_POLL_KEY_ID) {
    console.log(`Кнопка "${CREATE_MID_POLL_KEY}" нажата в чате ${chatId}`);

    await createPollMsg(bot, SHUFFLE_MID_CHAT_ID, options);
  }

  if (chatId && data === CREATE_PRO_POLL_KEY_ID) {
    console.log(`Кнопка "${CREATE_PRO_POLL_KEY}" нажата в чате ${chatId}`);

    await createPollMsg(bot, SHUFFLE_PRO_CHAT_ID, options);
  }
});
