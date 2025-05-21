import { IsEmail, IsString } from 'class-validator';

export class CreateLoginDto {
@IsEmail({}, { message: 'The provided email is not valid' })
email: string;

@IsString({ message: 'Password must be a string' })
password: string;
}
