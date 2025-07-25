import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpCode,
  UseGuards
} from '@nestjs/common';
import { ProductSectionPagesService } from './product_section_pages.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiBearerAuth } from '@nestjs/swagger'; 

/*DTO*/
import { CreateProductSectionPageDto } from './dto/create-product-section-page.dto';
import { UpdateProductSectionPageDto } from './dto/update-product-section-page.dto';


/*Guard*/
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { AuthenticationGuard } from 'src/guards/authentication.guard';

/*Decorators*/
import { Permissions } from 'src/roles/decorators/permissions.decorator';

/*Enums*/
import { Resource } from 'src/roles/enums/resource.enum'
import { Action } from 'src/roles/enums/action.enum';
 

@ApiTags('Product Section Pages')
@Controller('product-section-pages')
export class ProductSectionPagesController {
  constructor(private readonly service: ProductSectionPagesService) {}
  
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.PAGE_SECTIONS, actions: [Action.CREATE] }])
  @Post('add-section-pages')
  create(@Body() dto: CreateProductSectionPageDto) {
    return this.service.create(dto);
  }

  @Get('view-section-pages')
  findAll() {
    return this.service.findAll();
  }

  @Get('view-a-section-page/:sectionPageId')
  findOne(@Param('sectionPageId') sectionPageId: string) {
    return this.service.findOne(sectionPageId);
  }
  
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.PAGE_SECTIONS, actions: [Action.UPDATE] }])
  @Put(':sectionPageId')
  update(
    @Param('sectionPageId') sectionPageId: string,
    @Body() dto: UpdateProductSectionPageDto,
  ) {
    return this.service.update(sectionPageId, dto);
  }
  
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.PAGE_SECTIONS, actions: [Action.DELETE] }])
  @Delete(':sectionPageId')
  @HttpCode(204)
  remove(@Param('sectionPageId') sectionPageId: string) {
    return this.service.remove(sectionPageId);
  }
 
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.PAGE_SECTIONS, actions: [Action.UPDATE] }])
  @Put('/add-product-to-section-page/:sectionPageId/:productId')
  addProduct(
    @Param('sectionPageId') sectionPageId: string,
    @Param('productId') productId: string,
  ) {
    return this.service.addProductToSection(sectionPageId, productId);
  }

  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.PAGE_SECTIONS, actions: [Action.UPDATE] }])
  @Put('/remove-product-from-section-page/:sectionPageId/:productId')
  removeProduct(
    @Param('sectionPageId') sectionPageId: string,
    @Param('productId') productId: string,
  ) {
    return this.service.removeProductFromSection(sectionPageId, productId);
  }
}
