// create‐product.dto.ts

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProductVariableDto } from './create-product-variable.dto';

export class CreateProductDto {
  @ApiPropertyOptional({
    description: 'UUID of the category the product belongs to',
    example: 'b8a8d7f9-1e56-4e2b-9f99-4f890db44a12',
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Cotton T-Shirt',
  })
  @IsNotEmpty()
  @IsString()
  productName: string;

  @ApiPropertyOptional({
    description: 'URL or Base64 string of the product image',
    example: 'https://example.com/images/tshirt.png',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Description of the product',
    example: 'A comfortable cotton t-shirt',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Original price of the product',
    example: 29.99,
  })
  @IsNotEmpty()
  @IsNumber()
  originalPrice: number;

  @ApiPropertyOptional({
    description: 'Discount percentage (0–100)',
    example: 15,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentageTag?: number;

  @ApiProperty({
    description: 'List of size variants and their quantities',
    type: [CreateProductVariableDto],
  })
  @IsNotEmpty({ each: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariableDto)
  productVariables: CreateProductVariableDto[];
}
