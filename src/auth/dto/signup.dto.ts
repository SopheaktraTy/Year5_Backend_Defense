import { IsString, IsEmail, IsOptional, Matches, MinLength, IsIn } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/^(?=.*[0-9])/, { message: 'Password must contain at least one number' })
  @Matches(/^(?=.*[A-Za-z])/, { message: 'Password must contain at least one letter' })
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Firstname must be at least 3 characters long' })
  firstname?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Lastname must be at least 3 characters long' })
  lastname?: string;

  @IsOptional()
  @IsString()
  @IsIn(['admin', 'user'], { message: 'Role must be either admin or user' })
  role?: string;
}
