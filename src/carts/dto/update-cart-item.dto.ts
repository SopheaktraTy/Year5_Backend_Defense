import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, IsString } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'The quantity of the item in the cart',
    type: Number,
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiProperty({
    description: 'The size of the item (e.g., M, L, XL)',
    type: String,
    example: 'M',
    required: false,
  })
  @IsOptional()
  @IsString()
  size?: string;
}
