export interface ValidationFieldError {
  field: string;
  message: string;
}

export class ValidationAppError extends Error {
  public statusCode: number;
  public errors: ValidationFieldError[];

  constructor(errors: ValidationFieldError[], message = 'Errores de validación', statusCode = 400) {
    super(message);
    this.name = 'ValidationAppError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
