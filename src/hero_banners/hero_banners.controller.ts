/*NestJS imports*/
import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApiTags, ApiParam } from '@nestjs/swagger';

/*Service*/
import { HeroBannersService } from './hero_banners.service';

/*DTOs*/
import { CreateHeroBannerDto } from './dto/create-hero-banner.dto';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto';

/*Guards*/
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { AuthenticationGuard } from 'src/guards/authentication.guard';

/*Decorators*/
import { Permissions } from 'src/roles/decorators/permissions.decorator';

/*Enums*/
import { Resource } from 'src/roles/enums/resource.enum'
import { Action } from 'src/roles/enums/action.enum';

@ApiTags('Hero Banners')
@Controller('hero-banners')
export class HeroBannersController {
  constructor(private readonly heroBannersService: HeroBannersService) {}
  
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.HERO_BANNERS, actions: [Action.CREATE] }])
  @Post('/add-a-hero-banner')
  create(@Body() createHeroBannerDto: CreateHeroBannerDto) {
    return this.heroBannersService.create(createHeroBannerDto);
  }

  @Get('view-all-hero-banner')
  findAll() {
    return this.heroBannersService.findAll();
  }

  @Get('view-a-hero-banner/:heroBannerId')
  @ApiParam({ name: 'heroBannerId', type: 'string' })
  findOne(@Param('heroBannerId') heroBannerId: string) {
    return this.heroBannersService.findOne(heroBannerId);
  }
  
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.HERO_BANNERS, actions: [Action.UPDATE] }])
  @Put('update-a-hero-banner/:heroBannerId')
  @ApiParam({ name: 'heroBannerId', type: 'string' })
  update(
    @Param('heroBannerId') heroBannerId: string,
    @Body() updateHeroBannerDto: UpdateHeroBannerDto,
  ) {
    return this.heroBannersService.update(heroBannerId, updateHeroBannerDto);
  }
  
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.HERO_BANNERS, actions: [Action.DELETE] }])
  @Delete('/delete-a-hero-banner/:heroBannerId')
  @ApiParam({ name: 'heroBannerId', type: 'string' })
  remove(@Param('heroBannerId') heroBannerId: string) {
    return this.heroBannersService.remove(heroBannerId);
  }
}
