import { IsNotEmpty } from "class-validator";
export class CreateProductDto {

    @IsNotEmpty()
    title: string;



}
