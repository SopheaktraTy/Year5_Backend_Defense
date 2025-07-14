import { SetMetadata } from "@nestjs/common"
import { PermissionDto } from "src/roles/dto/permission.dto"

export const PERMISSION_KEY = 'permissions';

export const Permissions = (permissionDto: PermissionDto[]) => 
    SetMetadata( PERMISSION_KEY, permissionDto);

   