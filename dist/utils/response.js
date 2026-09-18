"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data, message = 'OK', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.successResponse = successResponse;
const errorResponse = (res, message = 'Error interno del servidor', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message,
        data: null,
    };
    if (errors) {
        response.errors = errors;
    }
    return res.status(statusCode).json(response);
};
exports.errorResponse = errorResponse;
