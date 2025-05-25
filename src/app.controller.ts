import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './auth/guards/auth.guard';  // adjust path if needed
import { AppService } from './app.service';

@ApiTags('example')
@ApiBearerAuth()           // Adds Bearer token auth info to Swagger UI
@UseGuards(AuthGuard)     // Protects all routes in this controller
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  getHello() {
    return this.appService.getHello();
  }
}
[]