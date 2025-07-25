import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductSectionPageDto {
  @ApiProperty({
    example: 'Top Trending',
    description: 'Title of the product section (e.g., "New Arrivals", "Top Deals")',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'https://example.com/banner.jpg',
    description: 'Banner image URL or base64 string',
  })
  @IsOptional()
  @IsString()
  bannerImage?: string;

  @ApiProperty({
    example: ['6a3b2f57-489b-4af2-b934-251c67e287a0', 'e84be40f-7f1a-4f03-a631-d3d9b8320de3'],
    description: 'List of product UUIDs to include in the section',
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  productIds: string[];
}
