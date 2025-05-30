import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, IsArray, ValidateNested, Min, Max, } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductVariableDto {
  @ApiProperty({
    description: 'Size of the product variant (e.g., S, M, L, XL)',
    example: 'M',
  })
  @IsNotEmpty()
  @IsString()
  size: string;

  @ApiProperty({
    description: 'Quantity available for this size',
    example: 10,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;
}

export class CreateProductDto {
  @ApiProperty({
    description: 'UUID of the category the product belongs to',
    example: 'b8a8d7f9-1e56-4e2b-9f99-4f890db44a12',
  })
  @IsOptional()
  category_id?: string;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Cotton T-Shirt',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'URL of the product image',
    example: 'http://example.com/image.png',
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
  original_price: number;

  @ApiPropertyOptional({
    description: 'Discounted price of the product, if any',
    example: 24.99,
  })
  @IsOptional()
  @IsNumber()
  discounted_price?: number;

  @ApiPropertyOptional({
    description: 'Discount percentage (0-100)',
    example: 15,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Min(0)
  @Max(100)
  discount_percentage_tag?: number;

  @ApiProperty({
    description: 'List of product size variants with quantities',
    type: [ProductVariableDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductVariableDto)
  productVariables: ProductVariableDto[];
}
