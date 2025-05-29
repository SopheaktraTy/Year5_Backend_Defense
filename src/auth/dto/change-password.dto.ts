import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'OldPassword123',
    description: 'The current password of the user',
  })
  @IsString()
  oldpassword: string;

  @ApiProperty({
    example: 'NewPassword456',
    description: 'The new password to set',
  })
  @IsString()
  newpassword: string;
}
