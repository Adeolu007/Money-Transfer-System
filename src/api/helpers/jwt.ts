import jwt, { JwtPayload } from 'jsonwebtoken';
import 'dotenv/config';
import { User } from '../../models/user';
import { AppDataSource } from '../../Database/data-source';

interface UserPayload {
    id: string;
}

const JWTSecret = process.env.JWTSecret;

if (!JWTSecret) {
    throw new Error("JWTSecret environment variable is not defined");
}

async function generateToken(user: UserPayload): Promise<string> {
    const payload = {
        subject: user.id,
    };

    const options = {
        expiresIn: '2d',
    };

    try {
        const token = jwt.sign(payload, JWTSecret as string, options);
        return token;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error('An unknown error occurred');
        }
    }
}

async function decodeToken(token: string): Promise<User | null> {
    try {
        const decoded = jwt.verify(token, JWTSecret as string) as JwtPayload;

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({ where: { id: decoded.subject } });

        if (!user) throw new Error('No such user');
        return user;
    } catch (error) {
        return null;
    }
}

export { generateToken, decodeToken };

