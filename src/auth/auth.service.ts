import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

//Create a User
async signup(createAuthDto: CreateAuthDto) {
  const emailInUse = await this.userRepository.findOne({ where: { email: createAuthDto.email } });
  if (emailInUse) {
    throw new HttpException('អ៊ីមែលនេះត្រូវបានប្រើរួចហើយ', HttpStatus.BAD_REQUEST);
  }
  const hashedPassword = await bcrypt.hash(createAuthDto.password, 10); // Hash the password
  const newUser = this.userRepository.create({
    ...createAuthDto,
    password: hashedPassword, // Use the hashed password
  });
  await this.userRepository.save(newUser); //create user document and save in postgres
  return { message: 'ការចុះបញ្ជីអ្នកប្រើបានជោគជ័យ' };
}

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
