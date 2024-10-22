export class LoginResponseDto {
    message!: string;
    token!: string;
    userDetails!: {
        email: string;
        username: string;
        firstName: string;
        lastName: string;
        accountNumber: number;
        accountBal: number;
    };
}