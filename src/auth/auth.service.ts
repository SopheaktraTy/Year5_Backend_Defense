import { Injectable } from '@nestjs/common';
import { CreateSignupDto } from './dto/signup.dto';
import { UpdateSignupDto } from './dto/change-password.dto';
import { CreateRefreshTokenDto } from './dto/refresh-token.dto';
import { CreateLoginDto } from'./dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { RefreshToken } from './entities/Refresh-token.entity'
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';




@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private UserRepository: Repository<User>,
    @InjectRepository(RefreshToken) private RefreshTokenRepository: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
  ) {}



/* Create a Signup or Create User */
async signup(createAuthDto: CreateSignupDto) {
  //check a email
  const emailInUse = await this.UserRepository.findOne({ where: { email: createAuthDto.email } });
  if (emailInUse) {
    throw new HttpException('This email is already in use', HttpStatus.BAD_REQUEST);
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
  const newUser = this.UserRepository.create({
    ...createAuthDto,
    password: hashedPassword, // Use the hashed password
  });
  //create user document and save in postgres
  await this.UserRepository.save(newUser);
  return { message: 'User registration successful' };
}



/* Create a Login and Generate JWT Token */
async login(createLoginDto: CreateLoginDto) {
  // 1. Find user by email
  const user = await this.UserRepository.findOne({ where: { email: createLoginDto.email } });
  if (!user) {
    throw new HttpException('This email does not exist in the system', HttpStatus.BAD_REQUEST);
  }
  // 2. Compare plaintext password with hashed password
  const passwordMatch = await bcrypt.compare(createLoginDto.password, user.password);
  if (!passwordMatch) {
    throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
  }
  // 3. Delete existing refresh tokens for this user (optional but recommended)
  await this.RefreshTokenRepository.delete({ user: user });
  // 4. Generate JWT AccessToken and RefreshToken
  const payload = { email: user.email, sub: user.id };
  const AccessToken = this.jwtService.sign(payload);
  const RefreshToken = uuidv4();
  // 5. Create and Save refresh token in the database
  const refreshToken = this.RefreshTokenRepository.create({
    token: RefreshToken,
    user: user,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });
  await this.RefreshTokenRepository.save(refreshToken);
  // 6. Return success message and tokens
  return {
    message: 'Login successful',
    AccessToken,
    RefreshToken,
  };
}



/* Create a refreshTokens and Generate refresh new access Token and refresh token */
async refreshTokens(createRefreshTokenDto: CreateRefreshTokenDto) {
  // 1. Find the old token with user relation
  const storedToken = await this.RefreshTokenRepository.findOne({
    where: { token: createRefreshTokenDto.token },
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
    token: newRefreshToken,
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



 
}

