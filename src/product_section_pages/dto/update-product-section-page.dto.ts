import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductSectionPageDto {
  @ApiPropertyOptional({
    example: 'Updated Section Title',
    description: 'New title for the product section',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/updated-banner.jpg',
    description: 'Updated banner image (URL or base64)',
  })
  @IsOptional()
  @IsString()
  bannerImage?: string;

  @ApiPropertyOptional({
    example: ['6a3b2f57-489b-4af2-b934-251c67e287a0'],
    description: 'Updated list of product UUIDs to include in the section',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  productIds?: string[];
}
