import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
@ApiProperty({
example: 'user@example.com',
description: 'User email address',
})
@IsEmail({}, { message: 'The provided email is not valid' })
email: string;

@ApiProperty({
example: 'YourSecurePassword123',
description: 'User password',
})
@IsString({ message: 'Password must be a string' })
password: string;
}
