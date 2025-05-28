import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; 
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../auth/entities/User.entity'; 
import { RefreshToken } from './entities/Refresh-token.entity' 
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConfig } from '../config/jwt.config'; 
import { ResetToken } from './entities/Reset-token.entity';
import { MailModule } from '../services/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, ResetToken]), // Import User repository
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule to access environment variables
      useFactory: async (configService: ConfigService) => jwtConfig(configService), // Call jwtConfig to configure JWT
      inject: [ConfigService], // Inject ConfigService to access environment variables
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], // Export AuthService and JwtModule for use in other modules
})
export class AuthModule {}
