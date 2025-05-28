import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Product } from '../products/entities/product.entity';
import { Product_Size } from '../product_sizes/entities/product_size.entity';
import { User } from '../auth/entities/User.entity';
import { RefreshToken } from '../auth/entities/Refresh-token.entity'
import { ResetToken } from '../auth/entities/Reset-token.entity';

export const databaseConfig = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => ({
    type: 'postgres',
    host: configService.get('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT'),
    username: configService.get('DATABASE_USERNAME'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME'),
    entities: [Product, Product_Size, User, RefreshToken, ResetToken],
    synchronize: true, // Set to false in production for safety
});
