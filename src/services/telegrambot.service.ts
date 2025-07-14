import { Inject, Injectable, Logger } from '@nestjs/common';

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

@Injectable()
export class TelegramBotService {
  private readonly logger = new Logger(TelegramBotService.name);

  constructor(
    @Inject('TELEGRAM_CONFIG') private readonly telegramConfig: TelegramConfig,
  ) {
    this.logger.log('TelegramBotService initialized with provided config.');
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

    const url = `https://api.telegram.org/bot${this.telegramConfig.botToken}/sendMessage`;

    try {
      // Use fetch or axios here, example with axios:
      const axios = await import('axios');
      await axios.default.post(url, {
        chat_id: this.telegramConfig.chatId,
        text: message,
        parse_mode: 'Markdown',
      });
      this.logger.log(`Sent order notification for order ${orderId}`);
    } catch (error) {
      this.logger.error('Failed to send Telegram message', error);
    }
  }
}
