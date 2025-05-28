import { IsString} from 'class-validator';

export class RefreshTokenDto {
@IsString()
refreshtoken: string;

}