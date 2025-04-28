import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductModule } from './products/product.module';
import { ProductSizeModule } from './product_sizes/product_size.module';
import { Product } from './products/entities/product.entity';
import { Product_Size } from './product_sizes/entities/product_size.entity';
import { AuthModule } from './auth/auth.module';

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
        password: 'Pheaktra123',
        database: 'Pheaktra',
        entities: [Product, Product_Size],
        synchronize: true, // Set to false in production!
      }),
      inject: [ConfigService], // Inject the ConfigService to get config values
    }),

    // Other modules you need
    ProductModule,
    ProductSizeModule,
    AuthModule,

  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
