import { IsNotEmpty, IsNumber, IsOptional, IsString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductSizeDto } from './create-product-size.dto';  // Correct import
  // Make sure to import the new DTO for ProductSize

export class CreateProductDto {

    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsNumber()
    originalPrice: number;

    @IsOptional()
    @IsNumber()
    salePrice: number;

    @IsOptional()
    @IsString()
    description: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductSizeDto)  // Transform and validate each element as ProductSizeDto
    sizes: ProductSizeDto[];  // Array of ProductSizeDto to handle multiple sizes

}
