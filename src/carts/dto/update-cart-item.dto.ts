import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'Quantity of the product', example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Size of the product', example: 'M' })
  @IsString()
  size: string;  // e.g., "S", "M", "L", "XL"
}
