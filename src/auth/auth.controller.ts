import { Controller, Post, Body, Put, UseGuards, Req, HttpCode, HttpStatus, Get} from '@nestjs/common';
import { AuthService } from './auth.service';
/**/
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../guards/authentication.guard';
/**/
import { SignupDto } from './dto/signup.dto';
import { VerifySignupLoginOtpDto } from './dto/verify-signup-login-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { ResendVerifyOtpDto } from './dto/resend-verify-otp.dto';


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

  @Post('verify-signup-otp')
  async verifySignupOtp(@Body() verifyOtpDto: VerifySignupLoginOtpDto) {
    const { email, otp } = verifyOtpDto;
    return await this.authService.verifySignupLoginOtp(email, otp);
  }
  @Post('resend-verify-otp')
  async resendVerifyOtp(@Body() resendOtpDto: ResendVerifyOtpDto) {
    const { email } = resendOtpDto;
    return this.authService.resendVerifyOtp(email);
  }

  @Post('refresh-token')
  async refreshTokens(@Body() RefreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(RefreshTokenDto);
  }

  // @ApiTags('example')
  @ApiBearerAuth('Access-Token')
  @UseGuards(AuthGuard)
  @Put('change-password')
  async changePassword(@Body() ChangePasswordDto: ChangePasswordDto, @Req() req) {
    return this.authService.changePassword( req.userId, ChangePasswordDto.oldpassword,ChangePasswordDto.newpassword);
  }
  
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto:ForgotPasswordDto){
    return this.authService.forgetPassword(forgotPasswordDto.email)
  }


  @ApiBearerAuth('Access-Token')
  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.userId);

}
}
  
  // TODO: Get User Profile

  // TODO: Update User Profile

  // TODO: Get All Users

  // TODO: Get User by ID



