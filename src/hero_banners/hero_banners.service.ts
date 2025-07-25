import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroBanner } from './entities/hero_banner.entity';
import { CreateHeroBannerDto } from './dto/create-hero-banner.dto';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class HeroBannersService {
  constructor(
    @InjectRepository(HeroBanner)
    private readonly heroBannerRepository: Repository<HeroBanner>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createDto: CreateHeroBannerDto): Promise<HeroBanner> {
    const banner = new HeroBanner();
    banner.title = createDto.title;
    banner.image = createDto.image ?? null;

    if (createDto.productId) {
      const product = await this.productRepository.findOne({ where: { id: createDto.productId } });
      if (!product) throw new NotFoundException('Product not found');
      banner.product = product;
    }

    return this.heroBannerRepository.save(banner);
  }

  async findAll(): Promise<HeroBanner[]> {
    return this.heroBannerRepository.find({ relations: ['product'] });
  }

  async findOne(id: string): Promise<HeroBanner> {
    const banner = await this.heroBannerRepository.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!banner) throw new NotFoundException('Hero banner not found');
    return banner;
  }

  async update(id: string, updateDto: UpdateHeroBannerDto): Promise<HeroBanner> {
    const banner = await this.findOne(id);

    if (updateDto.title !== undefined) banner.title = updateDto.title;
    if (updateDto.image !== undefined) banner.image = updateDto.image;

    if (updateDto.productId !== undefined) {
      if (updateDto.productId === null) {
        banner.product = null;
      } else {
        const product = await this.productRepository.findOne({ where: { id: updateDto.productId } });
        if (!product) throw new NotFoundException('Product not found');
        banner.product = product;
      }
    }

    return this.heroBannerRepository.save(banner);
  }

  async remove(id: string): Promise<{ message: string }> {
    const banner = await this.findOne(id);
    await this.heroBannerRepository.remove(banner);
    return { message: 'Hero banner deleted successfully' };
  }
}
