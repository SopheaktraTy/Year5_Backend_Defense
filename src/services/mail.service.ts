import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';

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
  private readonly logoSvg: string;

  constructor(@Inject('MAIL_CONFIG') private mailConfig: MailConfig) {
    this.transporter = nodemailer.createTransport(this.mailConfig);
     this.logoSvg = readFileSync( join(process.cwd(), 'public', 'logo', 'Logo No Text.svg'), 'utf8' ).replace( /<svg([^>]+)>/, '<svg$1 style="width: 50%; height: auto; display: block;" viewBox="0 0 300 100">'
  );
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
  const resetLink = `http://localhost:3000/reset-password?resetToken=${token}`;
  const subject = 'Password Reset Request';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; background: #ffffff;">
      
      <!-- Logo Header -->
      <div style="text-align: center; padding: 40px 30px 20px; background: #ffffff; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: center; align-items: center; height: 40px; margin: 0 auto 20px; max-width: 200px;">
          ${this.logoSvg}
        </div>
      </div>

      <!-- Main Content -->
      <div style="padding: 40px 30px; background: #ffffff;">
        <!-- Icon Section -->
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="width: 60px; height: 60px; background: #f9fafb; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e7eb;">
            <div style="width: 30px; height: 30px; background: #4f46e5; border-radius: 50%; position: relative;">
              <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #ffffff; font-size: 14px;">🔒</div>
            </div>
          </div>
          <h2 style="color: #1f2937; margin: 0 0 10px; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
        </div>

        <!-- CTA Section -->
        <div style="background: #f9fafb; padding: 30px; border-radius: 12px; margin: 30px 0; border-left: 4px solid #4f46e5; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 20px; font-size: 16px; color: #1f2937; font-weight: 500;">Click the button below to create a new password for your account:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.2);">
              Reset Password
            </a>
          </div>
        </div>

        <!-- Alternative Link -->
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0;">
          <p style="margin: 0 0 15px; font-size: 14px; color: #1f2937; font-weight: 600;">Alternative Link:</p>
          <p style="margin: 0; font-size: 14px; color: #6b7280; word-break: break-all; line-height: 1.4;">
            <a href="${resetLink}" style="color: #4f46e5; text-decoration: underline;">${resetLink}</a>
          </p>
        </div>

        <!-- Security Notice -->
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #4f46e5;">
          <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
            <div style="width: 20px; height: 20px; background: #4f46e5; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <div style="color: #ffffff; font-size: 12px; font-weight: 600;">⚠️</div>
            </div>
            <div>
              <p style="margin: 0 0 10px; font-size: 16px; color: #1f2937; font-weight: 600;">Security Notice</p>
              <p style="margin: 0 0 12px; font-size: 14px; color: #6b7280; line-height: 1.5;">
                This link will expire in <strong style="color: #1f2937;">1 hour</strong> for your security.
              </p>
              <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                If you didn't request this password reset, please ignore this email or 
                <a href="mailto:support@yourapp.com" style="color: #4f46e5; text-decoration: none; font-weight: 500;">contact our support team</a>.
              </p>
            </div>
          </div>
        </div>

        <!-- Help Section -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 40px; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Need help? 
            <a href="mailto:support@yourapp.com" style="color: #4f46e5; text-decoration: none; font-weight: 500;">Contact our support team</a>
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 30px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 10px; font-size: 14px; color: #1f2937; font-weight: 600;">
          Monostore Team
        </p>
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          &copy; ${new Date().getFullYear()} MyApp. All rights reserved.
        </p>
      </div>
    </div>
  `;

  const text = `You requested a password reset. Use this link to reset your password: ${resetLink}`;

  return this.sendMail(to, subject, text, html);
}


async sendOtpEmail(to: string, otp: string) {
  const subject = 'Verify your account with OTP';
  const text = `Your OTP code is: ${otp}`;
  
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; background: #ffffff;">
      
      <!-- Logo Header -->
      <div style="text-align: center; padding: 40px 30px 20px; background: #ffffff; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; justify-content: center; align-items: center; height: 40px; margin: 0 auto 20px; max-width: 200px;">
          ${this.logoSvg}
        </div>
      </div>

      <!-- Header -->
      <div style="padding: 40px 30px 30px; text-align: center; background: #ffffff; border-bottom: 1px solid #e5e7eb;">
        <h1 style="color: #1f2937; margin: 0; font-size: 28px; font-weight: 700;">Verify Your Account</h1>
        <p style="color: #6b7280; font-size: 16px; margin: 10px 0 0; font-weight: 400;">Welcome! Please verify your email address to continue</p>
      </div>

      <!-- Main Content -->
      <div style="padding: 40px 30px; background: #ffffff;">
        
        <!-- OTP Section -->
        <div style="background: #f9fafb; padding: 40px 30px; border-radius: 16px; margin: 30px 0; text-align: center; border: 2px solid #e5e7eb;">
          <p style="margin: 0 0 25px; font-size: 18px; color: #1f2937; font-weight: 600;">Your verification code:</p>
          <div style="background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 20px 0; border: 1px solid #e5e7eb;">
            <div style="font-size: 42px; font-weight: 800; color: #4f46e5; letter-spacing: 12px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          <p style="margin: 15px 0 0; font-size: 14px; color: #6b7280;">Enter this code to verify your account</p>
        </div>

        <!-- Time Warning -->
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #4f46e5;">
          <div style="display: flex; align-items: flex-start; margin-bottom: 10px;">
            <div style="width: 20px; height: 20px; background: #4f46e5; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <div style="color: #ffffff; font-size: 12px; font-weight: 600;">⏰</div>
            </div>
            <div>
              <p style="margin: 0 0 8px; font-size: 16px; color: #1f2937; font-weight: 600;">Time Sensitive</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">
                This verification code will expire in <strong style="color: #1f2937;">5 minutes</strong> for security reasons.
              </p>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div style="background: #f9fafb; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #e5e7eb;">
          <h3 style="margin: 0 0 15px; font-size: 18px; color: #1f2937; font-weight: 600;">What's Next?</h3>
          <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
              <div style="width: 6px; height: 6px; background: #4f46e5; border-radius: 50%; margin: 8px 12px 0 0; flex-shrink: 0;"></div>
              <span>Enter this code in the verification form</span>
            </div>
            <div style="margin-bottom: 12px; display: flex; align-items: flex-start;">
              <div style="width: 6px; height: 6px; background: #4f46e5; border-radius: 50%; margin: 8px 12px 0 0; flex-shrink: 0;"></div>
              <span>Complete your account setup</span>
            </div>
            <div style="display: flex; align-items: flex-start;">
              <div style="width: 6px; height: 6px; background: #4f46e5; border-radius: 50%; margin: 8px 12px 0 0; flex-shrink: 0;"></div>
              <span>Start using your account immediately</span>
            </div>
          </div>
        </div>

        <!-- Help Section -->
        <div style="border-top: 1px solid #e5e7eb; padding-top: 25px; margin-top: 40px; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            If you didn't create an account, please ignore this email or 
            <a href="mailto:support@yourapp.com" style="color: #4f46e5; text-decoration: none; font-weight: 500;">contact our support team</a>.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; padding: 30px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0 0 10px; font-size: 14px; color: #1f2937; font-weight: 600;">
          Monostore Team
        </p>
        <p style="margin: 0; font-size: 12px; color: #6b7280;">
          &copy; ${new Date().getFullYear()} MyApp. All rights reserved.
        </p>
      </div>
    </div>
  `;

  return this.sendMail(to, subject, text, html);
}
}