import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateOrderItemDto {

@IsInt()
@Min(1)
quantity: number;

@IsInt()
@Min(0)
price_at_order: number;
}
