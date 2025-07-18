/*Nestjs Hyper Class*/
import { Controller, Post, Body, Put, UseGuards, Req, Patch, Param, Get, Delete} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth } from '@nestjs/swagger'

/*DTO*/
import { SignupDto } from './dto/signup.dto';
import { VerifySignupLoginOtpDto } from './dto/verify-signup-login-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forget-password.dto';
import { ResendVerifyOtpDto } from './dto/resend-verify-otp.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

/*Guard*/
import { AuthorizationGuard } from 'src/guards/authorization.guard';
import { AuthenticationGuard } from 'src/guards/authentication.guard';

/*Decorators*/
import { Permissions } from 'src/roles/decorators/permissions.decorator';

/*Enums*/
import { Resource } from 'src/roles/enums/resource.enum'
import { Action } from 'src/roles/enums/action.enum';




@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  
  // Authentication Endpoints
  @Permissions([{resource: Resource.AUTH, actions: [Action.CREATE] }])
  @Post('signup')
  async signUp(@Body() SignupDto: SignupDto) {
    return this.authService.signup(SignupDto);
  }
  
  @Permissions([{resource: Resource.AUTH, actions: [Action.CREATE] }])
  @Post('login')
  async login(@Body() LoginDto: LoginDto) {
    return this.authService.login(LoginDto);
  }
  
  @Permissions([{resource: Resource.AUTH, actions: [Action.CREATE] }])
  @Post('verify-signup-login-otp')
  async verifySignupOtp(@Body() verifyOtpDto: VerifySignupLoginOtpDto) {
    const { email, otp } = verifyOtpDto;
    return await this.authService.verifySignupLoginOtp(email, otp);
  }

  @Permissions([{resource: Resource.AUTH, actions: [Action.CREATE] }])
  @Post('resend-verify-otp')
  async resendVerifyOtp(@Body() resendOtpDto: ResendVerifyOtpDto) {
    const { email } = resendOtpDto;
    return this.authService.resendVerifyOtp(email);
  }

  @Permissions([{resource: Resource.AUTH, actions: [Action.CREATE] }])
  @Post('refresh-token')
  async refreshTokens(@Body() RefreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(RefreshTokenDto);
  }
  
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.AUTH, actions: [Action.UPDATE] }])
  @Put('change-password')
  async changePassword(@Body() ChangePasswordDto: ChangePasswordDto, @Req() req) {
    return this.authService.changePassword( req.userId, ChangePasswordDto.oldpassword,ChangePasswordDto.newpassword);
  }
  
  @Permissions([{resource: Resource.AUTH, actions: [Action.CREATE] }])
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto:ForgotPasswordDto){
    return this.authService.forgetPassword(forgotPasswordDto.email)
  }
  
  @Permissions([{resource: Resource.AUTH, actions: [Action.CREATE] }])
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.resetToken, body.newPassword);
  }

  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.AUTH, actions: [Action.READ] }])
  @Get('view-my-profile')
  async getProfile(@Req() req) {
    return this.authService.getProfile(req.user.id);

}
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.AUTH, actions: [Action.UPDATE] }])
  @Put('update-profile')
  async updateProfile(@Body() updateProfileDto: UpdateProfileDto, @Req() req) {
    return this.authService.updateProfile(req.userId, updateProfileDto);
}
 




  // User Management Endpoints
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.USER_MANAGEMENTS, actions: [Action.READ] }])
  @Get ('view-all-users')
    async getAllUsers() {
        return this.authService.getAllUsers();
      }


  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.USER_MANAGEMENTS, actions: [Action.UPDATE] }])
  @Patch('/suspend-a-user/:userId')
  async toggleUserSuspension(@Param('userId') userId: string) {
    return this.authService.toggleUserSuspension(userId);
  }
  
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.USER_MANAGEMENTS, actions: [Action.UPDATE] }])
  @Put('/change-user-role/:userId')
  async toggleUserRole(@Param('userId') userId: string) {
    return this.authService.toggleUserRole(userId);
  }
  
  @UseGuards(AuthenticationGuard, AuthorizationGuard)
  @ApiBearerAuth('Access-Token')
  @Permissions([{resource: Resource.USER_MANAGEMENTS, actions: [Action.DELETE] }])
  @Delete('/delete-user/:userId')
  async deleteUser(@Param('userId') userId: string) {
    return this.authService.deleteUser(userId);
  }

}
  



