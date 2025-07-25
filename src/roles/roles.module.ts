/*NestJS imports*/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

/*Service*/
import { RolesService } from './roles.service';

/*Controller*/
import { RolesController } from './roles.controller';

/*Entities*/
import { Role } from './entities/role.entity'; // Adjust the import path as necessary
import { Permission } from './entities/permission.entity'; // Adjust the import path as necessary


@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission]), // Assuming Role and Permission are your entities
    AuthModule
  ],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
