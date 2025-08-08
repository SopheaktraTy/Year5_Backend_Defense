import { ConfigService } from '@nestjs/config';

export const mailConfigFactory = (configService: ConfigService) => ({
  apiToken: configService.get<string>('MAILTRAP_API_TOKEN'),
  senderEmail: configService.get<string>('MAILTRAP_SENDER_EMAIL'), // must be verified in Mailtrap
  senderName: configService.get<string>('MAILTRAP_SENDER_NAME') || 'Monostore',
  apiUrl: (configService.get<string>('MAILTRAP_API_URL') || '').trim(), // ✅ include URL & trim whitespace
});
