import type TelegramBot from "node-telegram-bot-api";

export async function getChatInfo(bot: TelegramBot, chatId: number | string) {
  try {
    const chatInfo = await bot.getChat(chatId);

    return chatInfo;
  } catch (error) {
    console.error("Ошибка при получении информации о чате:", error);

    return null;
  }
}

export async function createPollMsg(
  bot: TelegramBot,
  targetChatId: string | undefined,
  options?: TelegramBot.EditMessageTextOptions | undefined
) {
  if (!targetChatId) {
    bot.editMessageText("❌ Опрос не создан. Не обнаружен ID чата.", options);

    return;
  }

  const chatInfo = await getChatInfo(bot, targetChatId);
  const chatTitle = chatInfo?.title;

  try {
    await bot.sendPoll(targetChatId, "Кто сегодня будет на занятии?", ["Я приду 💪", "Не я 🙅"], {
      is_anonymous: false,
      type: "regular",
    });

    bot.editMessageText(`🚀 Быстрый опрос отправлен в группу ${chatTitle}.`, options);
  } catch (error) {
    let errorMsg = "";

    if (error instanceof Error) {
      errorMsg = error.message;
    }

    const telegramErrMsg = errorMsg ? `Произошла ошибка при отправке:\n\n${errorMsg}` : "Произошла неизвестная ошибка.";

    bot.editMessageText(`❌ Опрос не создан. ${telegramErrMsg}`, options);

    console.error(error);
  }
}

export function isUserAdmin(userId: number, adminUserIds: number[]): boolean {
  return adminUserIds.includes(userId);
}

export function getHtml(botInfo: TelegramBot.User) {
  const botName = botInfo.first_name || "poll-bot";
  const botUsername = botInfo.username ? `@${botInfo.username}` : "";

  return `
          <!DOCTYPE html>
          <html lang="ru">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${botName} - Telegram Bot</title>
              <style>
                  body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      max-width: 800px;
                      margin: 0 auto;
                      padding: 40px 20px;
                      line-height: 1.6;
                      color: #333;
                  }
                  .header {
                      text-align: center;
                      margin-bottom: 40px;
                  }
                  .bot-name {
                      font-size: 2.5rem;
                      color: #0088cc;
                      margin: 10px 0;
                  }
                  .bot-username {
                      font-size: 1.2rem;
                      color: #666;
                  }
                  .status {
                      background: #f0f9ff;
                      border-left: 4px solid #0088cc;
                      padding: 15px;
                      margin: 30px 0;
                      border-radius: 4px;
                  }
                  .instructions {
                      background: #f9f9f9;
                      padding: 20px;
                      border-radius: 8px;
                      margin-top: 30px;
                  }
                  .button {
                      display: inline-block;
                      background: #0088cc;
                      color: white;
                      padding: 12px 24px;
                      text-decoration: none;
                      border-radius: 6px;
                      font-weight: bold;
                      margin-top: 20px;
                  }
                  .button:hover {
                      background: #006699;
                  }
              </style>
          </head>
          <body>
              <div class="header">
                  <h1 class="bot-name">${botName}</h1>
                  ${botUsername ? `<p class="bot-username">${botUsername}</p>` : ""}
                  <p>Умный Telegram-бот для создания опросов</p>
              </div>
              
              <div class="status">
                  <h2>✅ Бот активен и работает</h2>
                  <p>Режим: ${process.env.NODE_ENV === "production" ? "Продакшен 🚀" : "Разработка 🧪"}</p>
              </div>
              
              <div class="instructions">
                  <h2>Как использовать бота:</h2>
                  <ol>
                      <li>Откройте Telegram и найдите бота ${botUsername || "по его юзернейму"}</li>
                      <li>Отправьте команду <code>/start</code> для начала работы</li>
                      <li>Используйте <code>/poll</code> для создания опросов</li>
                  </ol>
                  
                  <a href="https://t.me/${botInfo.username || ""}" class="button" target="_blank">
                      Открыть бота в Telegram
                  </a>
              </div>
              
              <footer style="margin-top: 40px; text-align: center; color: #888;">
                  <p>Работает на Node.js + Express | Деплой на Amvera</p>
              </footer>
          </body>
          </html>
          `;
}
