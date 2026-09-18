import { body } from 'express-validator';

export const createValidator = [
  body('title')
    .notEmpty().withMessage('El titulo es requerido')
];


