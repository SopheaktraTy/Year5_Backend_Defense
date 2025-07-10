import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);
  private readonly telegramBotToken: string;
  private readonly chatId: string;

  constructor(private readonly configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (!token || !chatId) {
      throw new Error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be defined!');
    }

    this.telegramBotToken = token;
    this.chatId = chatId;
  }

  async sendOrderNotification(
    orderId: string,
    totalAmount: number,
    userName: string,
    productName: string,
  ): Promise<void> {
    const message = `
🛒 *New Order Created!*

👤 *User:* \`${userName}\`
📦 *Product:* \`${productName}\`
📦 *Order ID:* \`${orderId}\`
💵 *Total Amount:* \`${totalAmount.toLocaleString()}៛\`

🕒 _Created at:_ ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' })}
    `;

    const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;

    try {
      await axios.post(url, {
        chat_id: this.chatId,
        text: message,
        parse_mode: 'Markdown',
      });
      this.logger.log(`Sent order notification to Telegram bot for order ${orderId}`);
    } catch (error) {
      this.logger.error('Failed to send message to Telegram bot', error);
    }
  }
}
