// update-product-size.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProductSizeDto } from './create-product-size.dto';  // Correct import

export class UpdateProductSizeDto extends PartialType(CreateProductSizeDto) {}
