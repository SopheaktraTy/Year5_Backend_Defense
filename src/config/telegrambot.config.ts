import { ConfigService } from '@nestjs/config';

export const telegramConfigFactory = (configService: ConfigService) => {
  const botToken = configService.get<string>('TELEGRAM_BOT_TOKEN');
  const chatId = configService.get<string>('TELEGRAM_CHAT_ID');

  if (!botToken || !chatId) {
    throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be defined!');
  }

  return {
    botToken,
    chatId,
  };
}