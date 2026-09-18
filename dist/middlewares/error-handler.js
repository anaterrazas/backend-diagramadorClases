"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../utils/response");
const sequelize_1 = require("sequelize");
const http_error_1 = require("../utils/http-error");
const validation_error_1 = require("../utils/validation-error");
const errorHandler = (err, req, res, next) => {
    console.error('[ERROR]', err);
    if (err instanceof http_error_1.HttpError) {
        return (0, response_1.errorResponse)(res, err.message, err.statusCode);
    }
    if (err instanceof validation_error_1.ValidationAppError) {
        return (0, response_1.errorResponse)(res, 'Errores de validación', 400, err.errors);
    }
    if (err instanceof sequelize_1.ValidationError) {
        const errors = err.errors.map((e) => ({
            field: e.path || 'unknown',
            message: e.message,
        }));
        return (0, response_1.errorResponse)(res, 'Error de validación de Sequelize', 400, errors);
    }
    if (err.statusCode && typeof err.message === 'string') {
        return (0, response_1.errorResponse)(res, err.message, err.statusCode);
    }
    return (0, response_1.errorResponse)(res);
};
exports.errorHandler = errorHandler;
