import { Controller, Post, Get, Put, Delete, Body, Param, NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RoleDto } from './dto/role.dto';
import { PermissionDto } from './dto/permission.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('/add-a-role')
  createRole(@Body() roleDto: RoleDto) {
    return this.rolesService.createRole(roleDto);
  }

  @Get('/view-all-roles')
  getAllRoles() {
    return this.rolesService.findAllRoles();
  }

  @Put('/update-role-name/:roleId')
  updateRoleName(@Param('roleId') roleId: string, @Body() updateDto: UpdateRoleDto) {
  return this.rolesService.updateRoleName(roleId, updateDto.name);
  }

  @Post('/add-a-permission/:roleId')
  addPermissions(@Param('roleId') roleId: string, @Body() permissionDto: PermissionDto) {
    return this.rolesService.addPermission(roleId, permissionDto);
  }

  @Put('/update-a-permission/:permissionId')
  updatePermissions(@Param('permissionId') permissionId: string, @Body() permissionDto: PermissionDto) {
    return this.rolesService.updatePermission(permissionId, permissionDto);
  }

  @Delete('/delete-a-permission/:permissionId')
  deletePermissions(@Param('permissionId') permissionId: string) {
    return this.rolesService.deletePermission(permissionId);
  }
}
