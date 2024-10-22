import { expressjwt, Request as JWTRequest } from 'express-jwt';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

function authJwt() {
    const secret = process.env.JWTSecret;
    if (!secret) {
        throw new Error('Missing secret. Please set the secret environment variable.');
    }

    return expressjwt({
        secret: secret as string,
        algorithms: ['HS256'],
        isRevoked: isRevoked,
    }).unless({
        path: [
            '/api/register',
            '/api/login',
            '/api-docs',        
            '/api-docs/',       
            '/api-docs.json'
        ],
    });
}

async function isRevoked(req: Request, token: any): Promise<boolean> {
    return false;
}

export { authJwt };
