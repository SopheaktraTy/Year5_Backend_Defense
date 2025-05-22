import { IsUUID, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRefreshTokenDto {
@IsString()
token: string;

}