import { IsString, IsEmail, IsOptional, Matches, MinLength } from 'class-validator';

export class CreateAuthDto {
@IsEmail()
email: string;

@IsString()
@MinLength(6)  // Ensures the password is at least 6 characters long
@Matches(/^(?=.*[0-9])/, { message: 'Password must contain at least one number' })  // Ensures the password contains at least one number
password: string;

@IsOptional()
@IsString()
name?: string;

@IsOptional()
@IsString()
role?: string;
}
