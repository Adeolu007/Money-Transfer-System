import { Router } from 'express';
import { initiateTransfer, listUserTransfers, sendFromCounter, getTransferHistory } from '../controllers/transfer';


class TransactionRoutes {
    public router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    public routes(): void {
        /**
        * @swagger
        * /transfer:
        *   post:
        *     summary: Initiate a money transfer
        *     description: Transfers money from the sender's account to the receiver's account.
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             properties:
        *               senderId:
        *                 type: string
        *               receiverId:
        *                 type: string
        *               amount:
        *                 type: number
        *               name:
        *                 type: string
        *             required:
        *               - senderId
        *               - receiverId
        *               - amount
        *               - name
        *     responses:
        *       201:
        *         description: Transfer completed successfully
        *         content:
        *           application/json:
        *             schema:
        *               type: object
        *               properties:
        *                 msg:
        *                   type: string
        *                 transaction:
        *                   type: object
        *                   additionalProperties: true
        *       400:
        *         description: Validation failed
        *       404:
        *         description: Sender or receiver not found
        *       500:
        *         description: An error occurred
        */
        this.router.post('/transfer', initiateTransfer);
        /**
       * @swagger
       * /transfers:
       *   get:
       *     summary: List user transfers
       *     description: Retrieves a paginated list of transfers for a specific user.
       *     parameters:
       *       - in: query
       *         name: userId
       *         required: true
       *         description: ID of the user to retrieve transfers for.
       *         schema:
       *           type: string
       *       - in: query
       *         name: page
       *         required: false
       *         description: Page number for pagination.
       *         schema:
       *           type: string
       *       - in: query
       *         name: pageSize
       *         required: true
       *         description: Number of transfers per page.
       *         schema:
       *           type: string
       *     responses:
       *       200:
       *         description: A list of user transfers
       *         content:
       *           application/json:
       *             schema:
       *               type: object
       *               properties:
       *                 transfers:
       *                   type: array
       *                   items:
       *                     type: object
       *                     additionalProperties: true
       *                 total:
       *                   type: integer
       *                 page:
       *                   type: integer
       *                 pageSize:
       *                   type: integer
       *                 totalPages:
       *                   type: integer
       *       400:
       *         description: Validation failed
       *       500:
       *         description: An error occurred
       */
        this.router.get('/transfers', listUserTransfers);
        /**
        * @swagger
        * /sendFromCounter:
        *   post:
        *     summary: Send money from counter
        *     description: Adds money to the receiver's account from the counter.
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             properties:
        *               receiverId:
        *                 type: string
        *               amount:
        *                 type: number
        *               name:
        *                 type: string
        *             required:
        *               - receiverId
        *               - amount
        *               - name
        *     responses:
        *       201:
        *         description: Money sent successfully from counter
        *         content:
        *           application/json:
        *             schema:
        *               type: object
        *               properties:
        *                 msg:
        *                   type: string
        *                 transaction:
        *                   type: object
        *                   additionalProperties: true
        *       400:
        *         description: Validation failed
        *       404:
        *         description: Receiver not found
        *       500:
        *         description: An error occurred
        */
        this.router.post('/sendFromCounter', sendFromCounter);

        /**
        * @swagger
        * /transfer-history/{userId}:
        *   get:
        *     summary: Get transfer history for a user
        *     description: Retrieves a user's transfer history with optional amount filters.
        *     parameters:
        *       - in: path
        *         name: userId
        *         required: true
        *         description: The ID of the user to retrieve transfer history for.
        *         schema:
        *           type: string
        *       - in: query
        *         name: minAmount
        *         required: false
        *         description: Minimum amount for transfers.
        *         schema:
        *           type: number
        *       - in: query
        *         name: maxAmount
        *         required: false
        *         description: Maximum amount for transfers.
        *         schema:
        *           type: number
        *     responses:
        *       200:
        *         description: List of transactions for the user
        *         content:
        *           application/json:
        *             schema:
        *               type: array
        *               items:
        *                 type: object
        *                 additionalProperties: true
        *       400:
        *         description: Invalid userId
        *       500:
        *         description: An unexpected error occurred
        */

        this.router.get('/transfer-history/:userId', getTransferHistory);
    }
}

export default new TransactionRoutes().router;
