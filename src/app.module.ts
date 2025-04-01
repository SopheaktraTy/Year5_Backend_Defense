import { Module } from '@nestjs/common';
import { ProductModule } from './product/product.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Load configuration settings from .env or other config source
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available globally
    }),

    // TypeORM configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Import ConfigModule so we can use ConfigService
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'), // or another port if necessary
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Set to false in production!
      }),
      inject: [ConfigService], // Inject the ConfigService to get config values
    }),

    // Other modules you need
    ProductModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
