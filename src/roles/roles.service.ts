import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository,  } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
/**/
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
/**/
import { RoleDto } from './dto/role.dto';
import { PermissionDto } from './dto/permission.dto';


@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role) private roleRepository: Repository<Role>,
        @InjectRepository(Permission) private permissionRepository: Repository<Permission>
    ) {}


/*--------- Create a new role with permissions  ---------*/
async createRole(roleDto: RoleDto) {
// 1. Check if role with the same name exists
const existingRole = await this.roleRepository.findOne({ where: { name: roleDto.name } });
if (existingRole) {
  throw new Error(`Role with name "${roleDto.name}" already exists.`);
}

// 2. Create and save the Role first
const role = this.roleRepository.create({ name: roleDto.name });
const savedRole = await this.roleRepository.save(role);

// 3. Map permissions to Permission entities
const permissionEntities = roleDto.permissions.map((perm) => {
  return this.permissionRepository.create({
    resource: perm.resource,
    actions: perm.actions,     // assuming 'action' is stored as enum[] or string[]
    role: savedRole           // connect to role
  });
});

// 4. Save permissions
await this.permissionRepository.save(permissionEntities);

// 5. Return the role with permissions
return {
  ...savedRole,
  permissions: permissionEntities
};

}

/*--------- Get all roles with permissions ---------*/
async findAllRoles(): Promise<Role[]> {
  return this.roleRepository.find({ relations: ['permissions'] });
}

/*--------- Update only the role name ---------*/
async updateRoleName(roleId: string, newName: string): Promise<Role> {
  const role = await this.roleRepository.findOneBy({ id: roleId });
  if (!role) {
    throw new NotFoundException(`Role ${roleId} not found`);
  }
  role.name = newName;
  return this.roleRepository.save(role);
}


/*--------- Add permissions to a role ---------*/
async addPermission(roleId: string, permissionDto: PermissionDto): Promise<Permission> {
  const role = await this.roleRepository.findOne({ where: { id: roleId } });
  if (!role) throw new NotFoundException(`Role ${roleId} not found`);

  const permission = this.permissionRepository.create({
    resource: permissionDto.resource,
    actions: permissionDto.actions,
    role,
  });

  return this.permissionRepository.save(permission);
}

/*--------- Replace all existing permissions with new ones ---------*/
async updatePermission( permissionId: string, permissionDto: PermissionDto ): Promise<{ message: string; data: Permission }> {
  const permission = await this.permissionRepository.findOne({
    where: { id: permissionId },
    relations: ['role'],
  });

  if (!permission) {
    throw new NotFoundException(`Permission ${permissionId} not found`);
  }

  permission.resource = permissionDto.resource;
  permission.actions = permissionDto.actions;

  const updated = await this.permissionRepository.save(permission);

  return {
    message: `Permission ${permissionId} updated successfully.`,
    data: updated,
  };
}


/*--------- Delete all permissions for a role ---------*/
async deletePermission(permissionId: string): Promise<{ message: string }> {
  const result = await this.permissionRepository.delete(permissionId);
  if (result.affected === 0) {
    throw new NotFoundException(`Permission ${permissionId} not found`);
  }
  return { message: `Permission ${permissionId} deleted successfully.` };
}

}