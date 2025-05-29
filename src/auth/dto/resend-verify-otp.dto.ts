import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendVerifyOtpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address to resend the verification OTP to',
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;
}
