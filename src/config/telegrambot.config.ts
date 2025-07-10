export default () => ({
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || 'your-telegram-bot-token',
    telegramChatId: process.env.TELEGRAM_CHAT_ID || 'your-chat-id',
  });