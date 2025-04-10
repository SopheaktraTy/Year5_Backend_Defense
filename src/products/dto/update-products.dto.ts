// update-product.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-products.dto';  // Correct import

export class UpdateProductDto extends PartialType(CreateProductDto) {}
