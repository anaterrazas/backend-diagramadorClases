"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationAppError = void 0;
class ValidationAppError extends Error {
    constructor(errors, message = 'Errores de validación', statusCode = 400) {
        super(message);
        this.name = 'ValidationAppError';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.ValidationAppError = ValidationAppError;
