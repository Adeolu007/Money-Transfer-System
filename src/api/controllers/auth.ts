import { Request, response, Response } from 'express';
import { AppDataSource } from '../../Database/data-source';
import { User } from '../../models/user';
import { generateToken } from '../helpers/jwt';
import { successResponse, errorHelper } from '../helpers/response';
import { CreateUserDto } from '../dto/CreateUserDto';
import { LoginRequestDto } from '../dto/LoginRequestDto';
import { LoginResponseDto } from '../dto/LoginResponseDto';

/**
 * Generates a unique account number based on the current year and a random six-digit number.
 *
 * @returns {number} The generated account number.
 */
const generateAccountNumber = (): number => {
    const currentYear = new Date().getFullYear();
    const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
    const accountNumber = Number(`${currentYear}${randomSixDigits}`);
    return accountNumber;
};

/**
 * Creates a new user account.
 *
 * @param {Request} req - The request object containing user details in the body.
 * @param {Response} res - The response object for sending the response back.
 * @returns {Promise<Response>} The response object containing the newly created user and a token.
 */
export const createUser = async (req: Request, res: Response): Promise<Response> => {
    try {

        const dto = new CreateUserDto(
            req.body.email,
            req.body.username,
            req.body.password,
            req.body.firstName,
            req.body.lastName
        );

        console.log("DTO before validation:", dto);

        await dto.validate();

        const userRepository = AppDataSource.getRepository(User);
        const accountNumber = generateAccountNumber();
        const newUser = userRepository.create({
            ...dto,
            accountBal: 0,
            accountNumber,
        });

        await userRepository.save(newUser);

        const token = await generateToken({ id: newUser.id });
        await userRepository.save(newUser);

        return res.status(201).json({ user: newUser, token });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        } else {
            return res.status(500).json({ error: 'An unknown error occurred' });
        }
    }
};

/**
 * Logs in a user and returns a token.
 *
 * @param {Request} req - The request object containing login details in the body.
 * @param {Response} res - The response object for sending the response back.
 * @returns {Promise<Response>} The response object containing the login message, token, and user details.
 */
export const loginUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const loginRequestDto: LoginRequestDto = req.body;
        console.log('Login request received:', loginRequestDto);

        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.findOne({
            where: { email: loginRequestDto.email },
            select: ['id', 'email', 'password', 'username', 'firstName', 'lastName', 'accountNumber', 'accountBal']
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isPasswordValid = await user.comparePassword(loginRequestDto.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = await generateToken(user);
        const loginResponseDto: LoginResponseDto = {
            message: "Successfully logged in",
            token,
            userDetails: {
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                accountNumber: user.accountNumber,
                accountBal: user.accountBal,
            },
        };

        return res.status(200).json(loginResponseDto);
    } catch (error) {
        return res.status(500).json({ error: (error as Error).message });
    }
};

/**
 * Changes a user's password.
 *
 * @param {Request} req - The request object containing the user ID as a URL parameter and new password in the body.
 * @param {Response} res - The response object for sending the response back.
 * @returns {Promise<Response>} The response object indicating the success of the password change.
 */
export const changePassword = async (req: Request, res: Response): Promise<Response> => {
    try {
        const userRepository = AppDataSource.getRepository(User);
        const userId = req.params.id;

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return errorHelper(res, 400, { message: "Validation failed", errors: "Current password and new password are required" });
        }

        const user = await userRepository.findOne({ where: { id: userId }, select: ['id', 'password'] });

        if (!user) {
            return errorHelper(res, 404, "User not found");
        }

        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return errorHelper(res, 401, "Current password is incorrect");
        }

        user.password = newPassword;
        await user.hashPassword();
        await userRepository.save(user);

        return successResponse(res, 200, "Password changed successfully");
    } catch (error) {
        return errorHelper(res, 500, (error as Error).message);
    }
};
