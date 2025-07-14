import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Password reset token received via email',
    example: 'df8901e2-1d35-4a5e-9325-f9d3912ddc2a',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'New password (min 6 characters, at least one letter and one number)',
    example: 'NewPass123',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  @Matches(/^(?=.*[A-Za-z])/, { message: 'Password must contain at least one letter' })
  newPassword: string;
}
