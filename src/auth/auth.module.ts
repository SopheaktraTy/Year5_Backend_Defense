import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '../services/mail.module';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfig } from '../config/jwt.config';

/*Entities*/
import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh_token.entity'
import { ResetToken } from './entities/reset_token.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/roles/entities/permission.entity';





@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken, ResetToken, Role, Permission]), // Import User repository
    ConfigModule, // ✅ Needed to inject config
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: jwtConfig,
    }),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService], 
})
export class AuthModule {}
