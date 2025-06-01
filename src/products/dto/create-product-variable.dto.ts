import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty,  } from '@nestjs/swagger';


export class CreateProductVariableDto {
  @ApiProperty({
    description: 'Size of the product variant (e.g., S, M, L, XL)',
    example: 'M',
  })
  @IsNotEmpty()
  @IsString()
  size: string;

  @ApiProperty({
    description: 'Quantity available for this size',
    example: 10,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;
}