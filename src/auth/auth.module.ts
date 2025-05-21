import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule and ConfigService
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../auth/entities/User.entity'; // Import the User entity
import { RefreshToken } from './entities/Refresh-token.entity' // Import the User entity
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConfig } from '../config/jwt.config'; // Import the jwtConfig function

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken]), // Import User repository
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule to access environment variables
      useFactory: async (configService: ConfigService) => jwtConfig(configService), // Call jwtConfig to configure JWT
      inject: [ConfigService], // Inject ConfigService to access environment variables
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
