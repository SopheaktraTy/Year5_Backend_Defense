import { PartialType } from '@nestjs/swagger';
import { CreateSignupDto } from './signup.dto';

export class UpdateSignupDto extends PartialType(CreateSignupDto) {}
