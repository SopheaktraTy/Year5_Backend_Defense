import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Matches } from 'class-validator';

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
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  @Matches(/^(?=.*[A-Za-z])/, { message: 'Password must contain at least one letter' })
  @IsString()
  newpassword: string;
}
