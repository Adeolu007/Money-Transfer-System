import { Request, response, Response } from 'express';
import { AppDataSource } from '../../Database/data-source';
import { User } from '../../models/user';
import { Transaction } from '../../models/transactions';
import { successResponse, errorHelper } from '../helpers/response';
import 'reflect-metadata';

const CACHE_TTL = 60 * 30;

/**
 * Initiates a money transfer between users.
 *
 * @param {Request} req - The request object containing the transfer details.
 * @param {Response} res - The response object for sending the response back.
 * @returns {Promise<Response>} The response object indicating the result of the transfer.
 */

export const initiateTransfer = async (req: Request, res: Response): Promise<Response> => {
    const { senderId, receiverId, amount, name } = req.body;

    if (!senderId || !receiverId || !amount || !name) {
        return errorHelper(res, 400, 'Validation failed! All fields are required.');
    }

    try {
        const userRepository = AppDataSource.getRepository(User);
        const transactionRepository = AppDataSource.getRepository(Transaction);


        const sender = await userRepository.findOne({ where: { id: senderId } });
        const receiver = await userRepository.findOne({ where: { id: receiverId } });

        if (!sender || !receiver) {
            return errorHelper(res, 404, 'Sender or receiver not found.');
        }

        if (sender.accountBal < amount) {
            return errorHelper(res, 400, 'Insufficient balance for the transfer.');
        }


        sender.accountBal -= amount;
        receiver.accountBal += amount;


        await userRepository.save(sender);
        await userRepository.save(receiver);

        const transaction = new Transaction();
        transaction.user = sender;
        transaction.amount = amount;
        transaction.balance = sender.accountBal;
        transaction.status = 'completed';
        transaction.transactionStatus = 'successful';
        transaction.accountNumber = receiver.accountNumber.toString();
        transaction.name = name;

        await transactionRepository.save(transaction);

        const response = {
            msg: 'Transfer completed successfully',
            transaction: {
                id: transaction.id,
                amount: transaction.amount,
                balance: transaction.balance,
                status: transaction.status,
                transactionStatus: transaction.transactionStatus,
                accountNumber: transaction.accountNumber,
                name: transaction.name,
            },
        };

        return successResponse(res, 201, response);
    } catch (error) {
        return errorHelper(res, 500, (error as Error).message);
    }
};
/**
 * Lists all transactions for a specific user.
 *
 * @param {Request} req - The request object containing the user ID and pagination parameters.
 * @param {Response} res - The response object for sending the response back.
 * @returns {Promise<Response>} The response object containing the list of transactions.
 */
export const listUserTransfers = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.query.userId as string;
    const page = req.query.page as string || '1';
    const pageSize = req.query.pageSize as string;
    if (!userId || isNaN(parseInt(page)) || !pageSize || isNaN(parseInt(pageSize))) {
        return errorHelper(res, 400, 'Validation failed: Invalid query parameters');
    }


    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);

    try {
        const transactionRepository = AppDataSource.getRepository(Transaction);
        const [transfers, total] = await transactionRepository.findAndCount({
            where: { user: { id: userId } },
            take: pageSizeNum,
            skip: (pageNum - 1) * pageSizeNum,
            order: { createdAt: 'DESC' }
        });

        const transferList = transfers.map(transfer => ({
            id: transfer.id,
            amount: transfer.amount,
            balance: transfer.balance,
            status: transfer.status,
            transactionStatus: transfer.transactionStatus,
            createdAt: transfer.createdAt,
            updatedAt: transfer.updatedAt,
        }));

        return successResponse(res, 200, {
            transfers: transferList,
            total,
            page: pageNum,
            pageSize: pageSizeNum,
            totalPages: Math.ceil(total / pageSizeNum),
        });
    } catch (error) {
        return errorHelper(res, 500, (error as Error).message);
    }
};

/**
 * Sends money from the counter to a specified receiver's account.
 *
 * @param {Request} req - The request object containing the receiver ID, amount, and name.
 * @param {Response} res - The response object for sending the response back.
 * @returns {Promise<Response>} The response object indicating the result of the transaction.
 */
export const sendFromCounter = async (req: Request, res: Response): Promise<Response> => {
    const { receiverId, amount, name } = req.body;
    try {
        if (!receiverId || !amount || !name) {
            return errorHelper(res, 400, 'Receiver ID, Amount, and Name are required.');
        }

        const userRepository = AppDataSource.getRepository(User);
        const transactionRepository = AppDataSource.getRepository(Transaction);


        const receiver = await userRepository.findOne({ where: { id: receiverId } });

        if (!receiver) {
            return errorHelper(res, 404, 'Receiver not found.');
        }
        receiver.accountBal = parseFloat(receiver.accountBal.toString());

        receiver.accountBal += amount;
        await userRepository.save(receiver);

        console.log(receiver.accountBal);
        const transaction = new Transaction();
        transaction.user = receiver;
        transaction.amount = amount;
        transaction.balance = receiver.accountBal;
        transaction.status = 'completed';
        transaction.transactionStatus = 'successful';
        transaction.accountNumber = receiver.accountNumber.toString();
        transaction.name = name;

        await transactionRepository.save(transaction);

        return successResponse(res, 201, { msg: 'Money sent successfully from counter', transaction });
    } catch (error) {
        return errorHelper(res, 500, (error as Error).message);
    }
};

/**
 * Retrieves the transfer history for a specified user.
 *
 * @param {Request} req - The request object containing the user ID as a URL parameter and optional query parameters for filtering.
 * @param {Response} res - The response object for sending the response back.
 * @returns {Promise<Response>} The response object containing the user's transaction history.
 */
export const getTransferHistory = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
    }

    const { minAmount, maxAmount } = req.query;
    const where: any = { userId };

    if (minAmount) {
        where.amount = { $gte: Number(minAmount) };
    }
    if (maxAmount) {
        where.amount = { ...where.amount, $lte: Number(maxAmount) };
    }

    try {
        const transactions = await AppDataSource.getRepository(Transaction).find({ where });
        return res.status(200).json(transactions);
    } catch (error) {
        console.error("Error fetching transfers:", error);
        return res.status(500).json({ message: 'Unexpected error' });
    }
};