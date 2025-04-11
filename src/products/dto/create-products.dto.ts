import { IsNotEmpty, IsNumber, IsOptional, IsString, IsInt, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductsSizeDto } from '../../products_size/dto/create-products-size.dto';  // Correct import
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
    @Type(() => CreateProductsSizeDto)  // Transform and validate each element as ProductSizeDto
    sizes: CreateProductsSizeDto[];  // Array of ProductSizeDto to handle multiple sizes

}
