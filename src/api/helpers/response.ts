import { Response } from 'express';

const successResponse = (res: Response, status: number, data: any) => {
  return res.status(status).json(data);
};

const errorHelper = (res: Response, status: number, error: any) => {
  return res.status(status).json(error);
};

export { successResponse, errorHelper };
