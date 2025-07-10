import { Module } from '@nestjs/common';
import { TelegramBotService } from '../services/telegrambot.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [TelegramBotService],
  exports: [TelegramBotService],
})
export class TelegramBotModule {}
