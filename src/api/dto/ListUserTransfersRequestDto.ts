import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ListUserTransfersRequestDto {
    @IsNotEmpty()
    @IsString()
    userId!: string;

    @IsOptional()
    @IsString()
    page?: string;

    @IsOptional()
    @IsString()
    pageSize?: string;
}