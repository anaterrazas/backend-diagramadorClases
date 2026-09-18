"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validation_error_1 = require("../utils/validation-error");
const validateRequest = (req, res, next) => {
    const result = (0, express_validator_1.validationResult)(req);
    if (!result.isEmpty()) {
        const errorMap = new Map();
        result.array().forEach((err) => {
            const field = err.path || err.param || 'unknown';
            if (!errorMap.has(field)) {
                errorMap.set(field, String(err.msg)); // solo guarda el primer error
            }
        });
        const formatted = Array.from(errorMap.entries()).map(([field, message]) => ({ field, message }));
        throw new validation_error_1.ValidationAppError(formatted);
    }
    next();
};
exports.validateRequest = validateRequest;
