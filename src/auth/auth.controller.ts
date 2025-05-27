import { Controller, Post, Body, Put, UseGuards, Req} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './guards/auth.guard';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() SignupDto: SignupDto) {
    return this.authService.signup(SignupDto);
  }
  @Post('login')
  async login(@Body() LoginDto: LoginDto) {
    return this.authService.login(LoginDto);
  }
  @Post('refresh')
  async refreshTokens(@Body() RefreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(RefreshTokenDto);
  }

  // @ApiTags('example')
  @ApiBearerAuth('Access-Token')
  @UseGuards(AuthGuard)
  @Put('change-password')
  async changePassword(
    @Body() ChangePasswordDto: ChangePasswordDto,
    @Req() req) {
    return this.authService.changePassword(
      req.userId,
      ChangePasswordDto.oldPassword,
      ChangePasswordDto.newPassword);
  }

    @Post('forgot-password')
    async forgotPassword(@Body() forgotPasswordDto:ForgotPasswordDto){
      return this.authService.forgotpassword(forgotPasswordDto)
    }

}


  // TODO: Forgot Password

  // TODO: Reset Password

  // TODO: Logout
  




  //TODO: create other service

  // TODO: Get User Profile

  // TODO: Update User Profile

  // TODO: Delete User Profile

  // TODO: Get All Users

  // TODO: Get User by ID



