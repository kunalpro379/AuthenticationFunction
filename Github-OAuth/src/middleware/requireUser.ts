import { NextFunction, Request, Response } from 'express';

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized - Please login to continue',
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};