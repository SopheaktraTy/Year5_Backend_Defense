// create-product.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsNotEmpty()
  @IsUUID()
  category_id: string;  // Category ID is required and must be a UUID

  @IsOptional()
  @IsUUID()
  user_id?: string;  // Optional user ID

  @IsNotEmpty()
  @IsString()
  name: string;  // 'name' is required

  @IsOptional()
  @IsString()
  picture?: string;  // Optional field for the product's picture

  @IsOptional()
  @IsString()
  description?: string;  // Optional field for the product's description

  @IsNotEmpty()
  @IsNumber()
  price: number;  // Product price is required

  @IsOptional()
  @IsString()
  discount_type?: string;  // Optional discount type ('percent' or 'fixed')

  @IsOptional()
  @IsNumber()
  discount_value?: number;  // Optional discount value
}
