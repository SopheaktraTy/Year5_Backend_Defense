import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiProperty({ description: 'Cart item ID to include in the order' })
  @IsUUID()
  cart_item_id: string;
}
