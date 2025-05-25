import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateSignupDto } from './dto/signup.dto';
// import { Changepassword } from './dto/changepassword.dto';
import { CreateLoginDto } from './dto/login.dto';
import { CreateRefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() createSignupDto: CreateSignupDto) {
    return this.authService.signup(createSignupDto);
  }
  @Post('login')
  async login(@Body() createLoginDto: CreateLoginDto) {
    return this.authService.login(createLoginDto);
  }
  @Post('refresh')
  async refreshTokens(@Body() createRefreshTokenDto: CreateRefreshTokenDto) {
    return this.authService.refreshTokens(createRefreshTokenDto);
  }

  // TODO: POST CHANGE PASSWORD

  //  TOD

}
