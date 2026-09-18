import { body } from 'express-validator';

export const signInValidator = [
  body('email')
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('Debe ser un correo válido'),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('Debe tener al menos 6 caracteres'),
];

export const signUpValidator = [
  body('nombre')
    .notEmpty().withMessage('El correo es requerido'),

  body('email')
    .notEmpty().withMessage('El correo es requerido')
    .isEmail().withMessage('Debe ser un correo válido'),

  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('Debe tener al menos 6 caracteres'),
];
