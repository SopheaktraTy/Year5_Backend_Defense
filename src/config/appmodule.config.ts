// app-modules.config.ts
import { ProductModule } from '../products/products.module';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';
import { CartsModule } from '../carts/carts.module';
import { OrdersModule } from '../orders/orders.module';
import { MailModule } from '../services/mail.module';
import { TelegramModule } from '../services/telegrambot.module';
import { HeroBannersModule } from 'src/hero_banners/hero_banners.module';
import { ProductSectionPagesModule } from 'src/product_section_pages/product_section_pages.module'

export const appModules = [
CategoriesModule,
ProductModule,
CartsModule,
OrdersModule,
AuthModule,
HeroBannersModule,
ProductSectionPagesModule,
RolesModule,
MailModule,
TelegramModule, 

];
