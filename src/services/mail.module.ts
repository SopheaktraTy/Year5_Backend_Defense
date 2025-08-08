import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { mailConfigFactory } from '../config/mail.config';

@Module({
  imports: [ConfigModule], // ensure ConfigModule is available
  providers: [
    {
      provide: 'MAIL_CONFIG',
      useFactory: mailConfigFactory,
      inject: [ConfigService],
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
