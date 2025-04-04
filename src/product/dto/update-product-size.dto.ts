// update-product-size.dto.ts
import { PartialType } from '@nestjs/swagger';
import { ProductSizeDto } from './create-product-size.dto';  // Correct import

export class UpdateProductSizeDto extends PartialType(ProductSizeDto) {}
