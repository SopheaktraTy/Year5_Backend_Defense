import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user requesting password reset',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}
