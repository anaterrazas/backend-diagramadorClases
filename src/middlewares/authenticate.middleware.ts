import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'
import { HttpError } from '../utils/http-error';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new HttpError('Token no proporcionado', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number; correo: string };
    req.user = decoded;
    next();
  } catch (err) {
    next(new HttpError('Token inválido o expirado', 401));
  }
};
