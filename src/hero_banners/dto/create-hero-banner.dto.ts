import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHeroBannerDto {
  @ApiProperty({
    example: 'Summer Collection Launch',
    description: 'Main title of the hero banner',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'https://example.com/images/banner.jpg',
    description: 'Image URL or base64-encoded image string',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    example: 'e7c9f9f2-4f2d-46b2-b515-2d9b405a3439',
    description: 'Optional product ID to associate with the banner',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;
}
