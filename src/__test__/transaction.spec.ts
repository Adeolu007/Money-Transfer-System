import { sendFromCounter, listUserTransfers, getTransferHistory } from '../api/controllers/transfer';
import { Request, Response } from 'express';
import { AppDataSource } from '../Database/data-source';
import { User } from '../models/user';
import { Transaction } from '../models/transactions';
import { successResponse, errorHelper } from '../api/helpers/response';

jest.mock('../Database/data-source', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

jest.mock('../api/helpers/response', () => ({
    successResponse: jest.fn(),
    errorHelper: jest.fn(),
}));

describe('sendFromCounter', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockUserRepository: any;
    let mockTransactionRepository: any;

    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockUserRepository = {
            findOne: jest.fn(),
            save: jest.fn(),
        };
        mockTransactionRepository = {
            save: jest.fn(),
        };

        (AppDataSource.getRepository as jest.Mock).mockImplementation((model) => {
            if (model === User) return mockUserRepository;
            if (model === Transaction) return mockTransactionRepository;
            return null;
        });

        jest.clearAllMocks();
    });

    it('should send money successfully', async () => {
        req.body = {
            receiverId: 'receiver-id',
            amount: 100,
            name: 'John Doe',
        };

        const receiver = { id: 'receiver-id', accountBal: 500, accountNumber: '2024930310', save: jest.fn() };

        mockUserRepository.findOne.mockResolvedValueOnce(receiver);

        await sendFromCounter(req as Request, res as Response);

        expect(receiver.accountBal).toBe(600);
        expect(mockUserRepository.save).toHaveBeenCalledWith(receiver);
        expect(mockTransactionRepository.save).toHaveBeenCalled();
        expect(successResponse).toHaveBeenCalledWith(res, 201, expect.any(Object));
    });

    it('should return 400 if required fields are missing', async () => {
        await sendFromCounter(req as Request, res as Response);
        expect(errorHelper).toHaveBeenCalledWith(res, 400, 'Receiver ID, Amount, and Name are required.');
    });

    it('should return 404 if receiver does not exist', async () => {
        req.body = {
            receiverId: 'receiver-id',
            amount: 100,
            name: 'John Doe',
        };

        mockUserRepository.findOne.mockResolvedValueOnce(null); // Simulate receiver not found

        await sendFromCounter(req as Request, res as Response);
        expect(errorHelper).toHaveBeenCalledWith(res, 404, 'Receiver not found.');
    });

    it('should handle unexpected errors', async () => {
        req.body = {
            receiverId: 'receiver-id',
            amount: 100,
            name: 'John Doe',
        };

        mockUserRepository.findOne.mockImplementation(() => {
            throw new Error('Unexpected error');
        });

        await sendFromCounter(req as Request, res as Response);
        expect(errorHelper).toHaveBeenCalledWith(res, 500, 'Unexpected error');
    });
});

describe('listUserTransfers', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockTransactionRepository: any;

    beforeEach(() => {
        req = {
            query: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockTransactionRepository = {
            findAndCount: jest.fn(),
        };

        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTransactionRepository);
        jest.clearAllMocks();
    });

    it('should return 400 if userId is not provided', async () => {
        req.query = {
            page: '1',
            pageSize: '10',
        };

        await listUserTransfers(req as Request, res as Response);

        expect(errorHelper).toHaveBeenCalledWith(res, 400, 'Validation failed: Invalid query parameters');
    });

    it('should return 400 if page is not a number', async () => {
        req.query = {
            userId: 'user-id',
            page: 'not-a-number',
            pageSize: '10',
        };

        await listUserTransfers(req as Request, res as Response);

        expect(errorHelper).toHaveBeenCalledWith(res, 400, 'Validation failed: Invalid query parameters');
    });

    it('should return 400 if pageSize is not provided', async () => {
        req.query = {
            userId: 'user-id',
            page: '1',
        };

        await listUserTransfers(req as Request, res as Response);

        expect(errorHelper).toHaveBeenCalledWith(res, 400, 'Validation failed: Invalid query parameters');
    });

    it('should return transfers successfully', async () => {
        req.query = {
            userId: 'user-id',
            page: '1',
            pageSize: '10',
        };

        const transfers = [
            { id: '1', amount: 100, balance: 900, status: 'completed', transactionStatus: 'successful', createdAt: new Date(), updatedAt: new Date() },
            { id: '2', amount: 200, balance: 700, status: 'completed', transactionStatus: 'successful', createdAt: new Date(), updatedAt: new Date() },
        ];

        mockTransactionRepository.findAndCount.mockResolvedValue([transfers, transfers.length]);

        await listUserTransfers(req as Request, res as Response);

        expect(successResponse).toHaveBeenCalledWith(res, 200, {
            transfers: expect.any(Array),
            total: transfers.length,
            page: 1,
            pageSize: 10,
            totalPages: 1,
        });
    });

    it('should handle unexpected errors', async () => {
        req.query = {
            userId: 'user-id',
            page: '1',
            pageSize: '10',
        };

        mockTransactionRepository.findAndCount.mockImplementationOnce(() => {
            throw new Error('Unexpected error');
        });

        await listUserTransfers(req as Request, res as Response);

        expect(errorHelper).toHaveBeenCalledWith(res, 500, 'Unexpected error');
    });
});


describe('getTransferHistory', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let mockTransactionRepository: any;

    beforeEach(() => {
        req = {
            params: {},
            query: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        mockTransactionRepository = {
            find: jest.fn(),
        };

        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockTransactionRepository);
        jest.clearAllMocks();
    });

    it('should return transfer history filtered by amount range', async () => {
        req.params = { userId: '1' };
        req.query = { minAmount: '100', maxAmount: '500' };

        const transactions = [
            { id: '1', amount: 200, userId: 1 },
            { id: '2', amount: 300, userId: 1 },
        ];

        mockTransactionRepository.find.mockResolvedValue(transactions);

        await getTransferHistory(req as Request, res as Response);

        expect(mockTransactionRepository.find).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    userId: 1,
                    amount: expect.any(Object),
                }),
            })
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(transactions);
    });

    it('should return transfer history without filters when no query params are provided', async () => {
        req.params = { userId: '1' };

        const transactions = [
            { id: '1', amount: 200, userId: 1 },
            { id: '2', amount: 300, userId: 1 },
        ];

        mockTransactionRepository.find.mockResolvedValue(transactions);

        await getTransferHistory(req as Request, res as Response);

        expect(mockTransactionRepository.find).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    userId: 1,
                }),
            })
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(transactions);
    });

    it('should return 400 if userId is not a valid number', async () => {
        req.params = { userId: 'invalid-id' };

        await getTransferHistory(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid userId' });
    });

    it('should handle unexpected errors', async () => {
        req.params = { userId: '1' };
        mockTransactionRepository.find.mockRejectedValue(new Error('Unexpected error'));

        await getTransferHistory(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unexpected error' });
    });

    it('should handle filtering with only minAmount', async () => {
        req.params = { userId: '1' };
        req.query = {
            minAmount: '150',
        };

        const transactions = [
            { id: '2', amount: 200, userId: 1 },
        ];

        mockTransactionRepository.find.mockResolvedValue(transactions);

        await getTransferHistory(req as Request, res as Response);

        expect(mockTransactionRepository.find).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    userId: 1,
                    amount: expect.any(Object),
                }),
            })
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(transactions);
    });

    it('should handle filtering with only maxAmount', async () => {
        req.params = { userId: '1' };
        req.query = {
            maxAmount: '250',
        };

        const transactions = [
            { id: '1', amount: 200, userId: 1 },
        ];

        mockTransactionRepository.find.mockResolvedValue(transactions);

        await getTransferHistory(req as Request, res as Response);

        expect(mockTransactionRepository.find).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    userId: 1,
                    amount: expect.any(Object),
                }),
            })
        );
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(transactions);
    });
});