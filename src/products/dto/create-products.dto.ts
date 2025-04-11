import {IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, IsArray, ValidateNested} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductsSizeDto } from '../../products_size/dto/create-products-size.dto';

export class CreateProductDto {
  @IsNotEmpty()
  @IsUUID()
  category_id?: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  discount_type?: string; // e.g., "percent" or "fixed"

  @IsOptional()
  @IsNumber()
  discount_value?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductsSizeDto)
  sizes: CreateProductsSizeDto[];
}
