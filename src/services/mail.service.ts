import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface MailConfig {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
}

@Injectable()
export class MailService {
  private transporter;

  constructor(@Inject('MAIL_CONFIG') private mailConfig: MailConfig) {
    this.transporter = nodemailer.createTransport(this.mailConfig);
  }

  async sendMail(to: string, subject: string, text: string, html?: string) {
    const mailOptions = {
      from: '"MONOSTORE" <no-reply@example.com>',
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

  async sendOtpEmail(to: string, otp: string) {
    const subject = 'Verify your account with OTP';
    const text = `Your OTP code is: ${otp}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="https://yourdomain.com/assets/logo.png" alt="Company Logo" style="width: 120px;"/>
        </div>
        <h2 style="color: #007bff; text-align: center;">Verify Your Account</h2>
        <p>Thank you for signing up! Please use the one-time password (OTP) below to verify your account.</p>
        <p style="font-size: 28px; font-weight: bold; background: #f0f0f0; padding: 15px; text-align: center; letter-spacing: 5px; border-radius: 5px;">
          ${otp}
        </p>
        <p>This code will expire in 5 minutes.</p>
        <p>If you did not request this email, please ignore it.</p>
        <hr style="border:none; border-top:1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
      </div>
    `;
    return this.sendMail(to, subject, text, html);
  }
}
