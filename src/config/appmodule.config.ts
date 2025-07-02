// app-modules.config.ts
import { ProductModule } from '../products/products.module';
import { RolesModule } from '../roles/roles.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../services/mail.module';
import { CategoriesModule } from '../categories/categories.module';
import { CartsModule } from '../carts/carts.module';
import { OrdersModule } from '../orders/orders.module';

export const appModules = [
CategoriesModule,
ProductModule,
CartsModule,
OrdersModule,
AuthModule,
RolesModule,
MailModule,
];
