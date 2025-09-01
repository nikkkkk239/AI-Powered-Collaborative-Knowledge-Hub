import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error.stack);

  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    return res.status(400).json({ message: 'Validation Error', errors });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (error.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value' });
  }

  res.status(500).json({ 
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
};