import { PartialType } from '@nestjs/swagger';
import { CreateProductVariableDto  } from './create-product-variable.dto'

export class UpdateProductVariableDto  extends PartialType(CreateProductVariableDto ) {}
