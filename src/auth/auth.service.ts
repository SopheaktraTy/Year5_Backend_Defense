import { Injectable } from '@nestjs/common';
import { CreateSignupDto } from './dto/create-signup.dto';
import { UpdateSignupDto } from './dto/update-signup.dto';
import { CreateLoginDto } from'./dto/create-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}


/* Create a Signup or Create User */

async signup(createAuthDto: CreateSignupDto) {
  //check a email
  const emailInUse = await this.userRepository.findOne({ where: { email: createAuthDto.email } });
  if (emailInUse) {
    throw new HttpException('This email is already in use', HttpStatus.BAD_REQUEST);
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
  const newUser = this.userRepository.create({
    ...createAuthDto,
    password: hashedPassword, // Use the hashed password
  });
  //create user document and save in postgres
  await this.userRepository.save(newUser);
  return { message: 'User registration successful' };
}


/* Create a Login and Generate JWT Token */

async login(createLoginDto: CreateLoginDto) {
  // Find user by email
  const user = await this.userRepository.findOne({ where: { email: createLoginDto.email } });
  if (!user) {
    throw new HttpException('This email does not exist in the system', HttpStatus.BAD_REQUEST);
  }
  // Compare plaintext password with hashed password
  const passwordMatch = await bcrypt.compare(createLoginDto.password, user.password);
  if (!passwordMatch) {
    throw new HttpException('Incorrect password', HttpStatus.BAD_REQUEST);
  }
  // Generate JWT token
  const payload = { email: user.email, sub: user.id };
  const token = this.jwtService.sign(payload);

  // Return success message and token
  return {
    message: 'Login successful',
    token,
  };
}



  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateSignupDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}

