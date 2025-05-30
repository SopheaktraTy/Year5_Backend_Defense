import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Product } from '../products/entities/product.entity';
import { ProductVariable } from '../products/entities/product_variables.entity';
import { User } from '../auth/entities/user.entity';
import { RefreshToken } from '../auth/entities/refresh_token.entity'
import { ResetToken } from '../auth/entities/reset_token.entity';
import { Category } from '../categories/entities/category.entity'

export const databaseConfig = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT'),
    username: configService.get('DATABASE_USERNAME'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME'),
    entities: [Product, ProductVariable, User, RefreshToken, ResetToken, Category],
    synchronize: true, // Set to false in production for safety
});
