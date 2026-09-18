import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ValidationAppError, ValidationFieldError } from '../utils/validation-error';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const result = validationResult(req);
  
  if (!result.isEmpty()) {
    const errorMap = new Map<string, string>();

    result.array().forEach((err: any) => {
      const field = err.path || err.param || 'unknown';
      if (!errorMap.has(field)) {
        errorMap.set(field, String(err.msg)); // solo guarda el primer error
      }
    });

    const formatted: ValidationFieldError[] = Array.from(errorMap.entries()).map(
      ([field, message]) => ({ field, message })
    );

    throw new ValidationAppError(formatted);
  }

  next();
};