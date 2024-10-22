
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { validate } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    @Length(8)
    password: string;

    @IsNotEmpty()
    @IsString()
    firstName: string;

    @IsNotEmpty()
    @IsString()
    lastName: string;

    constructor(email: string, username: string, password: string, firstName: string, lastName: string) {
        this.email = email;
        this.username = username;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
    }

    // Method to validate the DTO
    // async validate() {
    //     const errors = await validate(this);
    //     if (errors.length > 0) {
    //         throw new Error(`Validation failed: ${errors.map(err => Object.values(err.constraints)).join(', ')}`);
    //     }
    // }
    async validate() {
        const errors = await validate(this);
        if (errors.length > 0) {
            // Gather error messages, checking if constraints is defined
            const errorMessages = errors
                .map(err => (err.constraints ? Object.values(err.constraints) : []))
                .flat(); // Flatten the array of messages

            throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
        }
    }
}
