/**/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
/**/
import { ProductModule } from './products/product.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from './services/mail.module';

/**/
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { CategoriesModule } from './categories/categories.module';

/**/

@Module({
  imports: [
    // Other modules you need
    ProductModule,
    AuthModule,
    RolesModule,

    // MailModule for sending emails
    MailModule,

    // TypeORM configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule so we can use ConfigService
      useFactory: async (configService: ConfigService) => databaseConfig(configService), // Use databaseConfig function
      inject: [ConfigService], // Inject the ConfigService to get config values
    }),

    // Importing the JwtModule with environment variables using jwtConfig
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => jwtConfig(configService), // Use jwtConfig function
      inject: [ConfigService],
    }),

    // Load configuration settings from .env or other config source
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available globally
    }),

    CategoriesModule,


  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
