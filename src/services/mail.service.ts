import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    const mailConfig = {
      host: this.configService.get<string>('MAILTRAP_HOST'),
      port: parseInt(this.configService.get<string>('MAILTRAP_PORT') ?? '0', 10),
      auth: {
        user: this.configService.get<string>('MAILTRAP_USER'),
        pass: this.configService.get<string>('MAILTRAP_PASS'),
      },
    };

    this.transporter = nodemailer.createTransport(mailConfig);
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    const mailOptions = {
      from: '"Auth-backend service" <no-reply@example.com>',
      to,
      subject,
      text,
      html,
    };
    return this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `http://yourapp.com/reset-password?token=${token}`;
    const subject = 'Password Reset Request';
    const html = `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>If you did not request this, please ignore this email.</p>
    `;
    const text = `You requested a password reset. Reset your password using this link: ${resetLink}`;
  
    return this.sendMail(to, subject, text, html);
  }
}
