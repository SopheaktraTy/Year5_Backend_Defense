import { IsNotEmpty, IsString, IsNumber, IsUUID, IsInt } from 'class-validator';
export class CreateProductsSizeDto {
@IsNotEmpty()
@IsUUID()
productId: string; // FK to the Products table

@IsNotEmpty()
@IsString()
size: string; // Example: "Small", "Medium", "Large"

@IsNotEmpty()
@IsNumber({ maxDecimalPlaces: 2 })
price: number; // Example: 10.99

@IsNotEmpty()
@IsInt()
size_quantity: number; // Example: 30
}
