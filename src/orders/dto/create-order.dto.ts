import { IsUUID, IsInt, Min } from 'class-validator';

export class CreateOrderDto {

@IsInt()
@Min(1)
order_no: number;

@IsInt()
@Min(0)
total_amount: number;
}
