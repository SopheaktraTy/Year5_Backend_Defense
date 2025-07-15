/*NestJS imports*/
import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

/*Service*/
import { RolesService } from './roles.service';

/*DTOs*/
import { RoleDto } from './dto/role.dto';
import { PermissionDto } from './dto/permission.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

/*Guard*/
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { AuthenticationGuard } from 'src/guards/authentication.guard';

/*Decorators*/
import { Permissions } from 'src/roles/decorators/permissions.decorator';

/*Enums*/
import { Resource } from 'src/roles/enums/resource.enum'
import { Action } from 'src/roles/enums/action.enum';

@UseGuards(AuthenticationGuard, AuthorizationGuard)
@ApiBearerAuth('Access-Token')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // Role Endpoints
  @Permissions([{resource: Resource.ROLES, actions: [Action.CREATE] }])
  @Post('/add-a-role')
  createRole(@Body() roleDto: RoleDto) {
    return this.rolesService.createRole(roleDto);
  }
  
  @Permissions([{resource: Resource.ROLES, actions: [Action.READ] }])
  @Get('/view-all-roles')
  getAllRoles() {
    return this.rolesService.findAllRoles();
  }
  
  @Permissions([{resource: Resource.ROLES, actions: [Action.UPDATE] }])
  @Put('/update-role-name/:roleId')
  updateRoleName(@Param('roleId') roleId: string, @Body() updateDto: UpdateRoleDto) {
  return this.rolesService.updateRoleName(roleId, updateDto.name);
  }
  

  // Permissions Endpoints
  @Permissions([{resource: Resource.PERMISSIONS, actions: [Action.CREATE] }])
  @Post('/add-a-permission/:roleId')
  addPermissions(@Param('roleId') roleId: string, @Body() permissionDto: PermissionDto) {
    return this.rolesService.addPermission(roleId, permissionDto);
  }
  
  @Permissions([{resource: Resource.PERMISSIONS, actions: [Action.UPDATE] }])
  @Put('/update-a-permission/:permissionId')
  updatePermissions(@Param('permissionId') permissionId: string, @Body() permissionDto: PermissionDto) {
    return this.rolesService.updatePermission(permissionId, permissionDto);
  }
  
  @Permissions([{resource: Resource.PERMISSIONS, actions: [Action.DELETE] }])
  @Delete('/delete-a-permission/:permissionId')
  deletePermissions(@Param('permissionId') permissionId: string) {
    return this.rolesService.deletePermission(permissionId);
  }
}
