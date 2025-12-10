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
