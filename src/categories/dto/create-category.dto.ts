import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
@ApiProperty({ example: 'Clothes', description: 'Category name' })
@IsString()
categoryName: string;

@ApiProperty({
example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...',
description: 'Base64 encoded image string (optional)',
required: false,
})
@IsString()
@IsOptional()
image?: string;

@ApiProperty({
example: 'Light meals and snacks',
description: 'Category description',
required: false,
})
@IsString()
@IsOptional()
description?: string;
}
