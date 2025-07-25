import { User } from '../auth/entities/user.entity';
import { RefreshToken } from '../auth/entities/refresh_token.entity';
import { ResetToken } from '../auth/entities/reset_token.entity';
import { Cart } from '../carts/entities/cart.entity';
import { CartItem } from '../carts/entities/cart_item.entity';
import { Category } from '../categories/entities/category.entity';
import { ProductVariable } from '../products/entities/product_variable.entity';
import { Product } from '../products/entities/product.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Order } from 'src/orders/entities/order.entity';
import { OrderItem } from 'src/orders/entities/order_item.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/roles/entities/permission.entity';
import { HeroBanner } from 'src/hero_banners/entities/hero_banner.entity';
import { ProductSectionPage } from 'src/product_section_pages/entities/product_section_page.entity';

export const databaseConfig = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USERNAME'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  synchronize: true,
  entities: [
    User,
    RefreshToken,
    ResetToken,
    ProductVariable,
    Product,
    Cart,
    CartItem,
    Category,
    Order,
    OrderItem,
    Role,
    Permission,
    HeroBanner,
    ProductSectionPage
  
  ],
});
