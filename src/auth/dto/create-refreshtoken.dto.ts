import { IsString} from 'class-validator';


export class CreateRefreshTokenDto {
@IsString()
token: string;

}