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
    @InjectRepository(User) private userRepository: Repository<User>,private readonly jwtService: JwtService,
  ) {}

//Create a User
async signup(createAuthDto: CreateSignupDto) {
  //check a email
  const emailInUse = await this.userRepository.findOne({ where: { email: createAuthDto.email } });
  if (emailInUse) {
    throw new HttpException('អ៊ីមែលនេះត្រូវបានប្រើរួចហើយ', HttpStatus.BAD_REQUEST);
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);
  const newUser = this.userRepository.create({
    ...createAuthDto,
    password: hashedPassword, // Use the hashed password
  });
  //create user document and save in postgres
  await this.userRepository.save(newUser);   return { message: 'ការចុះបញ្ជីអ្នកប្រើបានជោគជ័យ' };
}

//create a login
async login(createLoginDto: CreateLoginDto) {
  // check the email
  const user = await this.userRepository.findOne({ where: { email: createLoginDto.email } });
  if (!user) {
    throw new HttpException('អ៊ីមែលនេះមិនមាននៅក្នុងប្រព័ន្ធទេ', HttpStatus.BAD_REQUEST); // Email not found
  }
  // Compare the password
  const passwordMatch = await bcrypt.compare(createLoginDto.password, user.password);
  if (!passwordMatch) {
    throw new HttpException('ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ', HttpStatus.BAD_REQUEST); // Incorrect password
  }
  // Generate JWT token
  const payload = { email: user.email, sub: user.id , }; // Payload for the token (can include user info)
  const token = this.jwtService.sign(payload, {expiresIn: '1h'}); // Sign the token using the JwtService
  return {
    message: 'ការចុះឈ្មោះបានជោគជ័យ',
    token, // Send back the token to the client
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

