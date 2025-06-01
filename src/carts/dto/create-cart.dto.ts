import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCartItemDto } from './create-cart-item.dto';

export class CreateCartDto {
    @ApiProperty({ type: [CreateCartItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateCartItemDto)
    items: CreateCartItemDto[];
  }