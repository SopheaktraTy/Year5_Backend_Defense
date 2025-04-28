import { IsEmail, IsString } from 'class-validator';

export class CreateLoginDto {
@IsEmail({}, { message: 'អ៊ីមែលដែលបានផ្តល់មិនត្រឹមត្រូវទេ' })
email: string;

@IsString({ message: 'ពាក្យសម្ងាត់បានផ្តល់មិនត្រឹមត្រូវទេ' })
password: string;
}
