// src/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import { ValidationError } from 'sequelize';
import { HttpError } from '../utils/http-error';
import { ValidationAppError } from '../utils/validation-error';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[ERROR]', err);

  if (err instanceof HttpError) {
    return errorResponse(res, err.message, err.statusCode);
  }

  if (err instanceof ValidationAppError) {
    return errorResponse(res, 'Errores de validación', 400, err.errors);
  }

  if (err instanceof ValidationError) {
    const errors = err.errors.map((e) => ({
      field: e.path || 'unknown',
      message: e.message,
    }));
    return errorResponse(res, 'Error de validación de Sequelize', 400, errors);
  }

  if (err.statusCode && typeof err.message === 'string') {
    return errorResponse(res, err.message, err.statusCode);
  }

  return errorResponse(res);
};
