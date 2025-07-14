import { ConfigService } from '@nestjs/config';

export const mailConfigFactory = (configService: ConfigService) => ({
  host: configService.get<string>('MAILTRAP_HOST'),
  port: parseInt(configService.get<string>('MAILTRAP_PORT') ?? '0', 10),
  auth: {
    user: configService.get<string>('MAILTRAP_USER'),
    pass: configService.get<string>('MAILTRAP_PASS'),
  },
});
