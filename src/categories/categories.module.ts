import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AuthModule } from 'src/auth/auth.module';

/*Entities*/
import { Category } from './entities/category.entity';
import { Product } from '../products/entities/product.entity';


;

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product]),
  
    AuthModule,
    ],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
