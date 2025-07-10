// update-product.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateProductVariableDto } from './create-product-variable.dto';  // Correct import

export class UpdateProductVariableDto extends PartialType(CreateProductVariableDto) {}
