/*NestJS imports*/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

/*Service*/
import { ProductsService } from './products.service';

/*Controller*/
import { ProductsController } from './products.controller';

/*Module*/
import { AuthModule } from 'src/auth/auth.module';

/*Entities*/
import { Product } from './entities/product.entity';
import { ProductVariable } from './entities/product_variable.entity';
import { Category } from '../categories/entities/category.entity';



@Module({
  imports : [
    TypeOrmModule.forFeature([Product, ProductVariable, Category ]),
    JwtModule,
    AuthModule, 
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductModule {}
