import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    description: 'List of cart item IDs to be added to the order',
    type: [String],  // Array of cartItemIds (UUIDs)
  })
  @IsArray()
  @IsUUID('4', { each: true })  // Ensure each item in the array is a valid UUID
  items: string[];  // An array of cartItemIds (UUIDs)
}
