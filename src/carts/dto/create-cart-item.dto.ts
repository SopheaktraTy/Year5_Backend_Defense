import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, IsString } from 'class-validator'; // Add missing imports

export class CreateCartItemDto {
  @ApiProperty({ description: 'UUID of the product', example: 'abc-123-uuid' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity of the product', example: 2 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Size of the product', example: 'M' })
  @IsString()
  size: string;
}
