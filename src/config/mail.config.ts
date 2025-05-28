import { ConfigService } from '@nestjs/config';

export const mailConfig = (configService: ConfigService) => ({
  host: configService.get<string>('MAILTRAP_HOST'),
  port: parseInt(configService.get<string>('MAILTRAP_PORT') ?? '0', 10),
  user: configService.get<string>('MAILTRAP_USER'),
  pass: configService.get<string>('MAILTRAP_PASS'),
});