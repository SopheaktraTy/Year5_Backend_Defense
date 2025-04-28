// create-products-size.dto.ts
import { IsNotEmpty, IsString, IsNumber, IsUUID, IsInt } from 'class-validator';

export class CreateProductSizeDto {
  @IsNotEmpty()
  @IsUUID()
  product_id: string;  // FK to the Products table

  @IsNotEmpty()
  @IsString()
  size_tag: string;  // Example: "Small", "Medium", "Large"

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;  // Example: 10.99
}
