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
    productDetails: string,
    email: string,
    phoneNumber: string,
  ): Promise<void> {
const message = `
*Monostore Sales Receipt*
-------------------------------------------
*Customer*
Username: ${userName}  
Email: ${email}
Phone Number: ${phoneNumber}

*Order*
Order No: ${orderId}
Date: ${new Date().toLocaleString('en-GB', {
  timeZone: 'Asia/Phnom_Penh',
})}

*Items*
${productDetails}
-------------------------------------------
🧮 Subtotal: ${Number(totalAmount).toLocaleString()}$
💵 Paid: ${Number(totalAmount).toLocaleString()}$
-------------------------------------------
🙏 *Thank you for shopping!*
📍 Monostore - Phnom Penh
`

    const url = `https://api.telegram.org/bot${this.telegramConfig.botToken}/sendMessage`;

    try {
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
