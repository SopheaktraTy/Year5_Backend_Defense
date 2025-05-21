import { Injectable } from '@nestjs/common';
import { CreateSignupDto } from './dto/create-signup.dto';
import { UpdateSignupDto } from './dto/update-signup.dto';
import { CreateLoginDto } from'./dto/create-login.dto';
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
  // 3. Generate JWT AccessToken and RefreshToken
  const payload = { email: user.email, sub: user.id };
  const AccessToken = this.jwtService.sign(payload);
  const RefreshToken = uuidv4();
  // 4. Create and Save refresh token in the database
  const refreshToken = this.RefreshTokenRepository.create({
    token: RefreshToken,
    user: user,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });
    await this.RefreshTokenRepository.save(refreshToken);
  // 5. Return success message and token
  return {
    message: 'Login successful',
    AccessToken,
    RefreshToken,
  };
}



  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateSignupDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}

