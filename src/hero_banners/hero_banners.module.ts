
/*NestJS imports*/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/*Service*/
import { HeroBannersService } from './hero_banners.service';
/*Module*/
import { AuthModule } from 'src/auth/auth.module';

/*Controller*/
import { HeroBannersController } from './hero_banners.controller';


/*Entities*/
import { Product } from '../products/entities/product.entity';
import { HeroBanner } from './entities/hero_banner.entity';

@Module({
  imports:[
    TypeOrmModule.forFeature([HeroBanner,Product]),
     AuthModule, 
  ],
  controllers: [HeroBannersController],
  providers: [HeroBannersService],
})
export class HeroBannersModule {}
