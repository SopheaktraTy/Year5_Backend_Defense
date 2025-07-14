import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsArray } from 'class-validator';
import { Resource } from '../enums/resource.enum';
import { Action } from '../enums/action.enum';

export class PermissionDto {
  @ApiProperty({ enum: Resource })
  @IsEnum(Resource)
  resource: Resource;

  @ApiProperty({ enum: Action, isArray: true })
  @IsArray()
  @IsEnum(Action, { each: true })
  actions: Action[];
}
