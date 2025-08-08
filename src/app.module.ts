import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { appModules } from './config/appmodule.config'; // import the array here

import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';

import { JwtModule } from '@nestjs/jwt';
import { HeroBannersModule } from './hero_banners/hero_banners.module';
import { ProductSectionPagesModule } from './product_section_pages/product_section_pages.module';


@Module({
  imports: [
    // ✅ 1. Load env/config **first**
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', 
    }),

    // ✅ 2. Now it's safe to use
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => databaseConfig(configService),
      inject: [ConfigService],
    }),

    JwtModule.registerAsync({
    global: true,
    imports: [ConfigModule],
    useFactory: jwtConfig,
    inject: [ConfigService],
  }),

    // ✅ 3. Your feature modules
    ...appModules,

    

   

   
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
