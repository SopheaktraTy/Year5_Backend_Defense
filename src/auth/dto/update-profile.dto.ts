import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'User\'s first name',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  firstname?: string;

  @ApiPropertyOptional({
    description: 'User\'s last name',
    example: 'Doe',
  })
  @IsOptional()
  @IsString()
  lastname?: string;

  @ApiPropertyOptional({
    description: 'User\'s gender (e.g., Male, Female, Other)',
    example: 'Male',
  })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user (digits only)',
    example: 85512345678,
  })
  @IsOptional()
  @IsNumber()
  phone_number?: number;

  @ApiPropertyOptional({
    description: 'Date of birth (ISO 8601 format)',
    example: '2000-01-01',
  })
  @IsOptional()
  @IsDateString()
  date_of_birth?: Date;

  @ApiPropertyOptional({
    description: 'URL or filename of the user\'s profile image',
    example: 'profile123.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;
}
