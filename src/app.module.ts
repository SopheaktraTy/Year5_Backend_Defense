import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { appModules } from './config/appmodule.config'; // import the array here

import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';

import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    ...appModules, // spread the modules array here

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => databaseConfig(configService),
      inject: [ConfigService],
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => jwtConfig(configService),
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

   

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
