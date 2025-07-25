/*NestJS imports*/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/*Service*/
import { ProductSectionPagesService } from './product_section_pages.service';

/*module*/
import { AuthModule } from 'src/auth/auth.module';

/*Controller*/
import { ProductSectionPagesController } from './product_section_pages.controller';

/*Entities*/
import { Product } from '../products/entities/product.entity';
import { ProductSectionPage } from './entities/product_section_page.entity';

@Module({
  imports:[
      TypeOrmModule.forFeature([ProductSectionPage, Product]),
       AuthModule, 
    ],
  controllers: [ProductSectionPagesController],
  providers: [ProductSectionPagesService],
})
export class ProductSectionPagesModule {}
