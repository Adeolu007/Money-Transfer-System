import { Request, response, Response } from 'express';
import { AppDataSource } from '../../Database/data-source';
import { User } from '../../models/user';
import { successResponse, errorHelper } from '../helpers/response';
import { redisClient } from '../helpers/redisClient';
import { UserDetailsDto } from '../dto/UserDetailsDto'

const CACHE_TTL = 60 * 60;

/**
 * Retrieves a user by their ID.
 *
 * @param {Request} req - The request object containing the user ID as a URL parameter.
 * @param {Response} res - The response object for sending the response back.
 * @returns {Promise<Response>} The response object containing user details or an error message.
 */
export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const cacheKey = `user_${id}`;
    const cachedUser = await redisClient.get(cacheKey);

    if (cachedUser) {
      console.log('Returning cached user from Redis');
      return successResponse(res, 200, JSON.parse(cachedUser));
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: id.toString() } });

    if (!user) {
      return errorHelper(res, 404, 'User not found');
    }

    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(user));

    return successResponse(res, 200, {
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      accountNumber: user.accountNumber,
      accountBal: user.accountBal,
    });
  } catch (error) {
    return errorHelper(res, 500, (error as Error).message);
  }
};

/**
 * Retrieves a user by their username.
 *
 * @param {Request} req - The request object containing the username as a URL parameter.
 * @param {Response} res - The response object for sending the response back.
 * @returns {Promise<Response>} The response object containing user details or an error message.
 */
export const getUserByUsername = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { username } = req.params;
    const cacheKey = `user_${username}`;
    const cachedUser = await redisClient.get(cacheKey);
    if (cachedUser) {
      console.log('Returning cached user from Redis');
      return successResponse(res, 200, JSON.parse(cachedUser));
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { username } });

    if (!user) {
      return errorHelper(res, 404, 'User not found');
    }
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(user));

    return successResponse(res, 200, {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      accountNumber: user.accountNumber,
      accountBal: user.accountBal,
    });
  } catch (error) {
    return errorHelper(res, 500, (error as Error).message);
  }
};
/**
 * Retrieves a list of all users.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object for sending the response back.
 * @returns {Promise<Response>} The response object containing a list of users or an error message.
 */
export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
  const cacheKey = 'all_users';

  try {
    const cachedUsers = await redisClient.get(cacheKey);
    if (cachedUsers) {
      console.log('Returning cached users list from Redis');
      return successResponse(res, 200, JSON.parse(cachedUsers));
    }
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();

    if (users.length === 0) {
      return errorHelper(res, 404, 'No users found');
    }
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
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(userDetailsList));
    return successResponse(res, 200, userDetailsList);
  } catch (error) {
    return errorHelper(res, 500, (error as Error).message);
  }
};



