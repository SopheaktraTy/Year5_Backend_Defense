import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, Matches, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address. Must be a valid email format.',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'User password. Minimum 6 characters, must include at least one letter and one number.',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  @Matches(/^(?=.*[A-Za-z])/, { message: 'Password must contain at least one letter' })
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name. Minimum 3 characters.',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Firstname must be at least 3 characters long' })
  firstname: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name. Minimum 2 characters.',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'Lastname must be at least 2 characters long' })
  lastname: string;
}
