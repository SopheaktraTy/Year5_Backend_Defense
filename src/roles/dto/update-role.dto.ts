import { ApiProperty } from "@nestjs/swagger";
import { IsString,  IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;
}
