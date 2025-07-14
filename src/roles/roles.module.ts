import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm'
import { Role } from './entities/role.entity'; // Adjust the import path as necessary
import { Permission } from './entities/permission.entity'; // Adjust the import path as necessary

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission]), // Assuming Role and Permission are your entities
  ],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
