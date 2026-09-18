"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpValidator = exports.signInValidator = void 0;
const express_validator_1 = require("express-validator");
exports.signInValidator = [
    (0, express_validator_1.body)('email')
        .notEmpty().withMessage('El correo es requerido')
        .isEmail().withMessage('Debe ser un correo válido'),
    (0, express_validator_1.body)('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('Debe tener al menos 6 caracteres'),
];
exports.signUpValidator = [
    (0, express_validator_1.body)('nombre')
        .notEmpty().withMessage('El correo es requerido'),
    (0, express_validator_1.body)('email')
        .notEmpty().withMessage('El correo es requerido')
        .isEmail().withMessage('Debe ser un correo válido'),
    (0, express_validator_1.body)('password')
        .notEmpty().withMessage('La contraseña es requerida')
        .isLength({ min: 6 }).withMessage('Debe tener al menos 6 caracteres'),
];
