import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramBotService } from './telegrambot.service';
import { telegramConfigFactory } from '../config/telegrambot.config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'TELEGRAM_CONFIG',
      useFactory: telegramConfigFactory,
      inject: [ConfigService],
    },
    TelegramBotService,
  ],
  exports: [TelegramBotService],
})
export class TelegramModule {}
