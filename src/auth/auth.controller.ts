import { Controller, Post, Body, Put} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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
  // @ApiBearerAuth()         
  // @UseGuards(AuthGuard)
  // @Put('change-password')
  // async changePassword(@Body() ChangePasswordDto: ChangePasswordDto) {
  //   return this.authService.changePassword(ChangePasswordDto);
  // }
  

}
  // TODO: POST CHANGE PASSWORD

  // TODO: Forgot Password

  // TODO: Reset Password

  // TODO: Logout
  




  //TODO: create other service

  // TODO: Get User Profile

  // TODO: Update User Profile

  // TODO: Delete User Profile

  // TODO: Get All Users

  // TODO: Get User by ID



