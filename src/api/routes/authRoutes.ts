import { Router } from 'express';
import { createUser, loginUser, changePassword } from '../controllers/auth';
import 'reflect-metadata';

const router = Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user with the provided details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *             required:
 *               - email
 *               - username
 *               - password
 *               - firstName
 *               - lastName
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   additionalProperties: true
 *                 token:
 *                   type: string
 *       500:
 *         description: An error occurred
 */
router.post('/register', createUser);
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in an existing user
 *     description: Authenticates a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 userDetails:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     accountNumber:
 *                       type: string
 *                     accountBal:
 *                       type: number
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: An error occurred
 */
router.post('/login', loginUser);
/**
 * @swagger
 * /change-password/{id}:
 *   put:
 *     summary: Change user password
 *     description: Updates the password for a user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user whose password is to be changed.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             required:
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: User not found
 *       401:
 *         description: Current password is incorrect
 *       500:
 *         description: An error occurred
 */



router.put('/change-password/:id', changePassword);

export default router;
