import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateHeroBannerDto {
  @ApiPropertyOptional({
    example: 'Updated Hero Banner Title',
    description: 'New title for the hero banner',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/new-banner.jpg',
    description: 'Updated image URL or base64-encoded image string',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    example: 'e7c9f9f2-4f2d-46b2-b515-2d9b405a3439',
    description: 'Updated product ID to associate with the banner',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;
}
