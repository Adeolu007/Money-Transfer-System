import { AppDataSource } from '../Database/data-source';
import { Request, Response } from 'express';
import { createUser, changePassword } from '../api/controllers/auth';
import { app } from '../index';

jest.mock('../Database/data-source', () => ({
    AppDataSource: {
        initialize: jest.fn().mockResolvedValue(true),
        getRepository: jest.fn(),
    },
}));

beforeAll(async () => {
    await AppDataSource.initialize();
});

afterAll(async () => {

});

jest.mock('../api/helpers/jwt', () => ({
    generateToken: jest.fn().mockReturnValue('mockToken'),
}));

const mockRequest = {
    body: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        username: 'johndoe',
        currentPassword: 'password123',
        newPassword: 'newPassword123',
    },
    headers: {},
    method: 'POST',
    url: '/createUser',
    params: {},
    query: {},
    get: jest.fn(),
} as unknown as Request;

const mockResponse: Response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    sendStatus: jest.fn(),
    send: jest.fn(),
    end: jest.fn(),
} as unknown as Response;

describe('createUser', () => {
    const userRepository = {
        create: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(() => {
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepository);
        jest.clearAllMocks();
    });

    it('should create a new user and return user details and token', async () => {
        const mockUser = { id: 1, ...mockRequest.body, accountBal: 0, accountNumber: 12345 };
        userRepository.create.mockReturnValue(mockUser);
        userRepository.save.mockResolvedValue(mockUser);

        await createUser(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith({
            user: expect.objectContaining(mockUser),
            token: 'mockToken',
        });
    });

    it('should return 500 if an error occurs during user creation', async () => {
        const errorMessage = 'Database error';
        userRepository.create.mockReturnValue(undefined); // Simulate undefined user creation
        userRepository.save.mockRejectedValue(new Error(errorMessage));

        await createUser(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
    });
});



// changePassword
describe('changePassword', () => {
    const userRepository = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    const mockPasswordUser = {
        id: '1',
        password: 'hashedPassword',
        comparePassword: jest.fn(),
        hashPassword: jest.fn(),
    };

    beforeEach(() => {
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(userRepository);
        jest.clearAllMocks();
    });

    it('should change the password successfully', async () => {
        userRepository.findOne.mockResolvedValue(mockPasswordUser);
        mockPasswordUser.comparePassword.mockResolvedValue(true);

        const req = {
            params: { id: '1' },
            body: {
                currentPassword: 'hashedPassword',
                newPassword: 'newHashedPassword',
            },
        } as unknown as Request;

        await changePassword(req, mockResponse);

        expect(mockPasswordUser.hashPassword).toHaveBeenCalled();
        expect(userRepository.save).toHaveBeenCalledWith(mockPasswordUser);
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith("Password changed successfully");
    });

    it('should return 401 if current password is incorrect', async () => {
        userRepository.findOne.mockResolvedValue(mockPasswordUser);
        mockPasswordUser.comparePassword.mockResolvedValue(false);

        const req = {
            params: { id: '1' },
            body: {
                currentPassword: 'wrongPassword',
                newPassword: 'newHashedPassword',
            },
        } as unknown as Request;

        await changePassword(req, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith("Current password is incorrect");
    });

    it('should return 404 if user not found', async () => {
        userRepository.findOne.mockResolvedValue(null);

        const req = {
            params: { id: 'nonExistentId' },
            body: {
                currentPassword: 'anyPassword',
                newPassword: 'newHashedPassword',
            },
        } as unknown as Request;

        await changePassword(req, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith("User not found");
    });

    it('should return 400 if current or new password is missing', async () => {
        const req = {
            params: { id: '1' },
            body: {
                currentPassword: '',
                newPassword: '',
            },
        } as unknown as Request;

        await changePassword(req, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: "Validation failed",
            errors: "Current password and new password are required",
        });
    });

    it('should return 500 if an error occurs', async () => {
        userRepository.findOne.mockRejectedValue(new Error("Database error"));

        const req = {
            params: { id: '1' },
            body: {
                currentPassword: 'hashedPassword',
                newPassword: 'newHashedPassword',
            },
        } as unknown as Request;

        await changePassword(req, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith("Database error");
    });
});

