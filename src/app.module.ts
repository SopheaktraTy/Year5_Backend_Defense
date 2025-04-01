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
        host: 'localhost',
        port: 5432, // or another port if necessary #plus mean interger
        username: 'postgres',
        password: 'root',
        database: 'Pheaktra',
        entities: [],
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
