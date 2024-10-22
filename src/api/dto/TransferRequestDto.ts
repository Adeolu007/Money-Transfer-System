import { IsNotEmpty, IsString } from 'class-validator';

export class TransferRequestDto {
    @IsNotEmpty()
    @IsString()
    senderId!: string;

}
