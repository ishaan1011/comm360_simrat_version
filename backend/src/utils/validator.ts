import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const validateObjectId = (id: string): boolean => {
  const ObjectId = require('mongoose').Types.ObjectId;
  return ObjectId.isValid(id);
};

export const validateObjectIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!validateObjectId(id)) {
    return next(new AppError('Invalid ID format', 400));
  }
  next();
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
};

export const validateUsername = (username: string): boolean => {
  // 3-20 characters, alphanumeric and underscore
  const re = /^[a-zA-Z0-9_]{3,20}$/;
  return re.test(username);
}; 