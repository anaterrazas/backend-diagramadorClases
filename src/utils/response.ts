import { Response } from 'express';

export const successResponse = <T>(
  res: Response,
  data: T,
  message = 'OK',
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message = 'Error interno del servidor',
  statusCode = 500,
  errors: Array<{ field: string; message: string }> | null = null
) => {
  const response: any = {
    success: false,
    message,
    data: null,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
