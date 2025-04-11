// update-product-size.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProductsSizeDto } from './create-products-size.dto';  // Correct import

export class UpdateProductsSizeDto extends PartialType(CreateProductsSizeDto) {}
