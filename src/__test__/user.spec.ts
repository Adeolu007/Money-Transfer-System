import { getUserById, getUserByUsername, getAllUsers } from '../api/controllers/user';
import { Request, Response } from 'express';
import { AppDataSource } from '../Database/data-source';
import { User } from '../models/user';
import { redisClient } from '../api/helpers/redisClient';
import { successResponse, errorHelper } from '../api/helpers/response';
import { UserDetailsDto } from '../api/dto/UserDetailsDto';


jest.mock('../Database/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

jest.mock('../api/helpers/redisClient', () => ({
    redisClient: {
        get: jest.fn(),
        setEx: jest.fn(),
    },
}));

jest.mock('../api/helpers/response', () => ({
    successResponse: jest.fn(),
    errorHelper: jest.fn(),
}));


describe('getUserById', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    const userId = '123';

    beforeEach(() => {
        req = {
            params: {
                id: userId,
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue({
            findOne: jest.fn(),
        });
    });

    it('should return cached user', async () => {
        const cachedUser = JSON.stringify({
            email: 'test@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            accountNumber: '123456',
            accountBal: 1000,
        });

        (redisClient.get as jest.Mock).mockResolvedValue(cachedUser);

        await getUserById(req as Request, res as Response);

        expect(redisClient.get).toHaveBeenCalledWith(`user_${userId}`);
        expect(successResponse).toHaveBeenCalledWith(res, 200, JSON.parse(cachedUser));
        expect(AppDataSource.getRepository(User).findOne).not.toHaveBeenCalled(); // Ensure no DB call
    });

    it('should fetch user from database if not cached', async () => {
        (redisClient.get as jest.Mock).mockResolvedValue(null);
        const user = {
            email: 'test@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            accountNumber: '123456',
            accountBal: 1000,
        };

        (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValue(user);
        (redisClient.setEx as jest.Mock).mockResolvedValue(undefined);

        await getUserById(req as Request, res as Response);

        expect(redisClient.get).toHaveBeenCalledWith(`user_${userId}`);
        expect(AppDataSource.getRepository(User).findOne).toHaveBeenCalledWith({ where: { id: userId } });
        expect(redisClient.setEx).toHaveBeenCalledWith(`user_${userId}`, expect.any(Number), JSON.stringify(user));
        expect(successResponse).toHaveBeenCalledWith(res, 200, expect.objectContaining(user));
    });

    it('should return 404 if user not found', async () => {
        (redisClient.get as jest.Mock).mockResolvedValue(null);
        (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValue(null);

        await getUserById(req as Request, res as Response);

        expect(errorHelper).toHaveBeenCalledWith(res, 404, 'User not found');
    });

    it('should handle errors', async () => {
        (redisClient.get as jest.Mock).mockRejectedValue(new Error('Redis error'));

        await getUserById(req as Request, res as Response);

        expect(errorHelper).toHaveBeenCalledWith(res, 500, 'Redis error');
    });
});



describe('getUserByUsername', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    const username = 'testuser';

    beforeEach(() => {
        req = {
            params: {
                username,
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue({
            findOne: jest.fn(),
        });
    });

    it('should return cached user', async () => {
        const cachedUser = JSON.stringify({
            id: '1',
            email: 'test@example.com',
            username,
            firstName: 'Test',
            lastName: 'User',
            accountNumber: '123456',
            accountBal: 1000,
        });

        (redisClient.get as jest.Mock).mockResolvedValue(cachedUser);

        await getUserByUsername(req as Request, res as Response);

        expect(redisClient.get).toHaveBeenCalledWith(`user_${username}`);
        expect(successResponse).toHaveBeenCalledWith(res, 200, JSON.parse(cachedUser));
        expect(AppDataSource.getRepository(User).findOne).not.toHaveBeenCalled();
    });

    it('should fetch user from database if not cached', async () => {
        (redisClient.get as jest.Mock).mockResolvedValue(null);
        const user = {
            id: '1',
            email: 'test@example.com',
            username,
            firstName: 'Test',
            lastName: 'User',
            accountNumber: '123456',
            accountBal: 1000,
        };

        (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValue(user);
        (redisClient.setEx as jest.Mock).mockResolvedValue(undefined);

        await getUserByUsername(req as Request, res as Response);

        expect(redisClient.get).toHaveBeenCalledWith(`user_${username}`);
        expect(AppDataSource.getRepository(User).findOne).toHaveBeenCalledWith({ where: { username } });
        expect(redisClient.setEx).toHaveBeenCalledWith(`user_${username}`, expect.any(Number), JSON.stringify(user));
        expect(successResponse).toHaveBeenCalledWith(res, 200, expect.objectContaining(user));
    });

    it('should return 404 if user not found', async () => {
        (redisClient.get as jest.Mock).mockResolvedValue(null);
        (AppDataSource.getRepository(User).findOne as jest.Mock).mockResolvedValue(null);

        await getUserByUsername(req as Request, res as Response);

        expect(errorHelper).toHaveBeenCalledWith(res, 404, 'User not found');
    });

    it('should handle errors', async () => {
        (redisClient.get as jest.Mock).mockRejectedValue(new Error('Redis error'));

        await getUserByUsername(req as Request, res as Response);

        expect(errorHelper).toHaveBeenCalledWith(res, 500, 'Redis error');
    });
});


describe('getAllUsers', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockUserRepository: any;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockUserRepository = {
            find: jest.fn(),
        };
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);
    });

    it('should return cached users', async () => {
        const cachedUsers = JSON.stringify([
            {
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                accountNumber: '123456',
                accountBal: 1000,
            },
        ]);

        (redisClient.get as jest.Mock).mockResolvedValue(cachedUsers);

        await getAllUsers(req as Request, res as Response);

        expect(redisClient.get).toHaveBeenCalledWith('all_users');
        expect(successResponse).toHaveBeenCalledWith(res, 200, JSON.parse(cachedUsers));
    });

    it('should fetch users from database if not cached', async () => {
        (redisClient.get as jest.Mock).mockResolvedValue(null);
        const users = [
            {
                email: 'test@example.com',
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                accountNumber: 123456,
                accountBal: 1000,
            },
        ];

        mockUserRepository.find.mockResolvedValue(users);
        (redisClient.setEx as jest.Mock).mockResolvedValue(undefined);

        await getAllUsers(req as Request, res as Response);

        expect(redisClient.get).toHaveBeenCalledWith('all_users');
        expect(mockUserRepository.find).toHaveBeenCalled();

        const userDetailsList = users.map(user => {
            const userDto = new UserDetailsDto();
            userDto.email = user.email;
            userDto.username = user.username;
            userDto.firstName = user.firstName;
            userDto.lastName = user.lastName;
            userDto.accountNumber = user.accountNumber;
            userDto.accountBal = user.accountBal;
            return userDto;
        });

        expect(redisClient.setEx).toHaveBeenCalledWith('all_users', expect.any(Number), JSON.stringify(userDetailsList));
        expect(successResponse).toHaveBeenCalledWith(res, 200, userDetailsList);
    });

    it('should return 404 if no users found', async () => {
        (redisClient.get as jest.Mock).mockResolvedValue(null);
        mockUserRepository.find.mockResolvedValue([]);

        await getAllUsers(req as Request, res as Response);

        expect(redisClient.get).toHaveBeenCalledWith('all_users');
        expect(mockUserRepository.find).toHaveBeenCalled();
        expect(errorHelper).toHaveBeenCalledWith(res, 404, 'No users found');
    });

    it('should handle errors', async () => {
        (redisClient.get as jest.Mock).mockRejectedValue(new Error('Redis error'));

        await getAllUsers(req as Request, res as Response);

        expect(errorHelper).toHaveBeenCalledWith(res, 500, 'Redis error');
    });
});