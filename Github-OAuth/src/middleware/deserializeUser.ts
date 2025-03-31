import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma";

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    const JWT_SECRET = process.env.JWT_SECRET as string;
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
      
      if (!user) {
        return next();
      }
      
      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      // Invalid token
      next();
    }
  } catch (error) {
    next(error);
  }
};