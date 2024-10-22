import { Router } from 'express';
import { getUserById, getUserByUsername, getAllUsers } from '../controllers/user';

const router = Router();

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves a user by their unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                 username:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 accountNumber:
 *                   type: string
 *                 accountBal:
 *                   type: number
 *       404:
 *         description: User not found
 *       500:
 *         description: An error occurred
 */
router.get('/users/:id', getUserById);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     description: Retrieves a list of all users.
 *     responses:
 *       200:
 *         description: List of users found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   username:
 *                     type: string
 *                   firstName:
 *                     type: string
 *                   lastName:
 *                     type: string
 *                   accountNumber:
 *                     type: string
 *                   accountBal:
 *                     type: number
 *       404:
 *         description: No users found
 *       500:
 *         description: An error occurred
 */
router.get('/users', getAllUsers);

/**
 * @swagger
 * /users/username/{username}:
 *   get:
 *     summary: Get user by username
 *     description: Retrieves a user by their unique username.
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 username:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 accountNumber:
 *                   type: string
 *                 accountBal:
 *                   type: number
 *       404:
 *         description: User not found
 *       500:
 *         description: An error occurred
 */
router.get('/users/username/:username', getUserByUsername);

export default router;
