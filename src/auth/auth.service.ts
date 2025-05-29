/*DTO*/
import { SignupDto } from './dto/signup.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LoginDto } from'./dto/login.dto';

/*Entities*/
import { User } from './entities/User.entity';
import { RefreshToken } from './entities/Refresh-token.entity'
import { ResetToken } from './entities/Reset-token.entity';
/*Services*/
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus , NotFoundException, Injectable, UnauthorizedException, BadRequestException} from '@nestjs/common';
import { Repository, LessThan } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { MailService } from '..//services/mail.service';



@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private UserRepository: Repository<User>,
    @InjectRepository(RefreshToken) private RefreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository( ResetToken ) private ResetTokenRepository: Repository<ResetToken>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}



/* Create a Signup or Create User */
async signup(createAuthDto: SignupDto) {
  // 1. Check if email is already taken
  const existingUser = await this.UserRepository.findOne({ where: { email: createAuthDto.email } });
  if (existingUser) {
    throw new HttpException('This email address is already registered.', HttpStatus.BAD_REQUEST);
  }
  // 2. Hash the password securely
  const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
  // 3. Create new user with isVerified = false
  const newUser = this.UserRepository.create({
    ...createAuthDto,
    password: hashedPassword,
    isVerified: false,
  });
  await this.UserRepository.save(newUser);
  // 4. Generate 6-digit OTP and set expiry (5 minutes)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  newUser.otp = otp;
  newUser.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await this.UserRepository.save(newUser);
  // 5. Send OTP email using your styled email method
  await this.mailService.sendOtpEmail(newUser.email, otp);
  // 6. Return success message
  return { message: 'User registered successfully. Please verify your email using the code sent to you.' };
}

async resendVerifyOtp(email: string) {
  const user = await this.UserRepository.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundException('User account not found.');
  }
  // Generate new OTP and expiry (5 minutes)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await this.UserRepository.save(user);
  // Send OTP email using existing mail method
  await this.mailService.sendOtpEmail(user.email, otp);
  return { message: 'The verification code has been resent to your email.' };
}

/* Create a Signup or Create User */
async verifySignupLoginOtp(email: string, otp: string) {
  const user = await this.UserRepository.findOne({ where: { email } });
  if (!user) throw new HttpException('User account not found.', HttpStatus.BAD_REQUEST);

  if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    throw new HttpException('The verification code has expired or is invalid.', HttpStatus.BAD_REQUEST);
  }
  if (user.otp !== otp) {
    throw new HttpException('Incorrect verification code.', HttpStatus.BAD_REQUEST);
  }
  // If user is not verified (sign-up flow), mark verified
  if (!user.isVerified) {
    user.isVerified = true;
  }
  // Clear OTP fields after successful verification
  user.otp = null;
  user.otpExpiresAt = null;
  await this.UserRepository.save(user);
  // Generate JWT tokens
  const payload = { email: user.email, sub: user.id };
  const accessToken = this.jwtService.sign(payload);
  const refreshToken = uuidv4();
  // Save refresh token
  const refreshTokenEntity = this.RefreshTokenRepository.create({
    refresh_token: refreshToken,
    user,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  await this.RefreshTokenRepository.save(refreshTokenEntity);

  return {
    message: 'Verification code confirmed successfully.',
    accessToken,
    refreshToken,
  };
}

/* Login and Generate JWT Token */
async login(createLoginDto: LoginDto) {
  const user = await this.UserRepository.findOne({ where: { email: createLoginDto.email } });
  if (!user) throw new HttpException('The provided credentials are incorrect.', HttpStatus.BAD_REQUEST);

  const passwordMatch = await bcrypt.compare(createLoginDto.password, user.password);
  if (!passwordMatch) throw new HttpException('Invalid password. Please try again.', HttpStatus.BAD_REQUEST);

  if (!user.isVerified) {
    throw new HttpException('Account not verified. Please verify your email first.', HttpStatus.FORBIDDEN);
  }

  // Generate OTP and save
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry
  await this.UserRepository.save(user);

  // Send OTP email
  await this.mailService.sendOtpEmail(user.email, otp);

  return {
    message: 'OTP sent to your email. Please verify to complete login.'
  };
}


/* refreshTokens and Generate refresh new access Token and refresh token */
async refreshTokens(createRefreshTokenDto: RefreshTokenDto) {
  // 1. Find the old token with user relation
  const storedToken = await this.RefreshTokenRepository.findOne({
    where: { refresh_token: createRefreshTokenDto.refreshtoken },
    relations: ['user'],
  });
  if (!storedToken) {
    throw new HttpException('Refresh token not found', HttpStatus.UNAUTHORIZED);
  }
  // 2. Check if expired
  if (storedToken.expires_at < new Date()) {
    await this.RefreshTokenRepository.remove(storedToken);
    throw new HttpException('Refresh token expired', HttpStatus.UNAUTHORIZED);
  }
  const user = storedToken.user;
  // 3. Delete old token from database
  await this.RefreshTokenRepository.remove(storedToken);
  // 4. Generate new tokens
  const payload = { email: user.email, sub: user.id };
  const newAccessToken = this.jwtService.sign(payload);
  const newRefreshToken = uuidv4();
  // 5. Save new refresh token
  const newTokenEntity = this.RefreshTokenRepository.create({
    refresh_token: newRefreshToken,
    user,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  await this.RefreshTokenRepository.save(newTokenEntity);
  // 6. Return new tokens
  return {
    message: 'Token refreshed successfully',
    AccessToken: newAccessToken,
    RefreshToken: newRefreshToken,
    userid: user.id,
  };
}


/* changePassword */
async changePassword(userId: string, oldPassword: string, newPassword: string) {
  // Find the user by ID
  const user = await this.UserRepository.findOneBy({ id: userId });
  if (!user) {
    throw new NotFoundException('User not found.');
  }
  // Check if old password and new password are the same
  if (oldPassword === newPassword) {
    throw new UnauthorizedException('New password must be different from the old password');
  }
  // Compare the old password with the stored hashed password
  const passwordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!passwordMatch) {
    throw new UnauthorizedException('Invalid password. Please try again.');
  }
  // Hash the new password
  const newHashedPassword = await bcrypt.hash(newPassword, 10);
  // Update user password and save
  user.password = newHashedPassword;
  await this.UserRepository.save(user);
  return { message: 'Password changed successfully' };
  }

  /* forgetPassword */
  async forgetPassword(email: string) {
    // 1. Find user by email
    const user = await this.UserRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // 2. Delete all expired reset tokens for this user (expired before now)
    await this.ResetTokenRepository.delete({
      user: { id: user.id },
      expiresAt: LessThan(new Date()),
    });
    // 3. Generate reset token
    const resetToken = uuidv4();
    const resetTokenEntity = this.ResetTokenRepository.create({
      reset_token: resetToken,
      user,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // expires in 15 minutes
    });
    await this.ResetTokenRepository.save(resetTokenEntity);
    // 4. Send email using MailService (passing token only)
    await this.mailService.sendPasswordResetEmail(user.email, resetToken);
    return { message: 'Reset password link sent to your email' };
  }
}
