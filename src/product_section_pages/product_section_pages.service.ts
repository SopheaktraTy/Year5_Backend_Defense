import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductSectionPage } from './entities/product_section_page.entity';
import { CreateProductSectionPageDto } from './dto/create-product-section-page.dto';
import { UpdateProductSectionPageDto } from './dto/update-product-section-page.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class ProductSectionPagesService {
  constructor(
    @InjectRepository(ProductSectionPage)
    private readonly sectionRepo: Repository<ProductSectionPage>,

    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async create(dto: CreateProductSectionPageDto): Promise<ProductSectionPage> {
    const products = await this.productRepo.findByIds(dto.productIds || []);
    const section = this.sectionRepo.create({
      title: dto.title,
      banner_image: dto.bannerImage ?? null,
      products,
    });
    return this.sectionRepo.save(section);
  }

  async findAll(): Promise<ProductSectionPage[]> {
    return this.sectionRepo.find({ relations: ['products'] });
  }

  async findOne(id: string): Promise<ProductSectionPage> {
    const section = await this.sectionRepo.findOne({
      where: { id },
      relations: ['products'],
    });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async update(id: string, dto: UpdateProductSectionPageDto): Promise<ProductSectionPage> {
    const section = await this.findOne(id);

    if (dto.title !== undefined) section.title = dto.title;
    if (dto.bannerImage !== undefined) section.banner_image = dto.bannerImage;

    if (dto.productIds !== undefined) {
      section.products = await this.productRepo.findByIds(dto.productIds);
    }

    return this.sectionRepo.save(section);
  }

  async remove(id: string): Promise<void> {
    const section = await this.findOne(id);
    await this.sectionRepo.remove(section);
  }

  async addProductToSection(sectionId: string, productId: string): Promise<ProductSectionPage> {
    const section = await this.findOne(sectionId);
    const product = await this.productRepo.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const alreadyAdded = section.products.some(p => p.id === product.id);
    if (!alreadyAdded) {
      section.products.push(product);
      await this.sectionRepo.save(section);
    }

    return this.findOne(sectionId); // return with updated relations
  }

  async removeProductFromSection(sectionId: string, productId: string): Promise<ProductSectionPage> {
    const section = await this.findOne(sectionId);
    const productExists = section.products.some(p => p.id === productId);

    if (!productExists) throw new NotFoundException('Product not in section');

    section.products = section.products.filter(p => p.id !== productId);
    await this.sectionRepo.save(section);

    return this.findOne(sectionId); // return with updated relations
  }
}
