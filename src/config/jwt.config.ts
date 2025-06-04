import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export const jwtConfig = async (configService: ConfigService): Promise<JwtModuleOptions> => ({
  secret: configService.get<string>('JWT_SECRET'), // Get secret from .env
  signOptions: {
    expiresIn: '10h', // Set token expiration (can be customized)
  },
});
