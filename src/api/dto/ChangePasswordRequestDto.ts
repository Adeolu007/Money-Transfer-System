import { IsString, IsNotEmpty, Length } from 'class-validator';

export class ChangePasswordRequestDto {
    @IsString()
    @IsNotEmpty()
    currentPassword: string;

    @IsString()
    @IsNotEmpty()
    @Length(8)
    newPassword: string;

    constructor(currentPassword: string, newPassword: string) {
        this.currentPassword = currentPassword;
        this.newPassword = newPassword;
    }
}