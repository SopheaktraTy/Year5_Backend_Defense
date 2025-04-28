import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User.entity';

@Module({
  imports : [TypeOrmModule.forFeature([User])],
  exports: [TypeOrmModule], // Export TypeOrmModule so other modules can access the ProductsRepository
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

