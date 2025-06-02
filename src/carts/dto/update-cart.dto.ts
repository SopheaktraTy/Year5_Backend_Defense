import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCartItemDto } from './create-cart-item.dto';

export class UpdateCartDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCartItemDto)
  items: CreateCartItemDto[];
}
