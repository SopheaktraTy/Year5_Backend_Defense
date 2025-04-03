import { IsNotEmpty, IsNumber, IsString, IsInt } from 'class-validator';

export class ProductSizeDto {

    @IsNotEmpty()
    @IsString()
    size: string;  // Size of the product (e.g., Small, Medium, Large)

    @IsNotEmpty()
    @IsNumber()
    price: number;  // Price for this specific size

    @IsNotEmpty()
    @IsInt()
    quantity: number;  // Quantity for this specific size
}
