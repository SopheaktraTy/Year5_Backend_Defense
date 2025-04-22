import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductModule } from './products/product.module';
import { ProductSizeModule } from './product_sizes/product_size.module';
import { Products } from './products/entities/product.entity';
import { Product_Sizes } from './product_sizes/entities/product_size.entity';

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
        entities: [Products, Product_Sizes],
        synchronize: true, // Set to false in production!
      }),
      inject: [ConfigService], // Inject the ConfigService to get config values
    }),




    // Other modules you need
    ProductModule,
    ProductSizeModule,



  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
