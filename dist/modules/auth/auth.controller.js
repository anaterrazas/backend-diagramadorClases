"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.logout = exports.register = exports.login = void 0;
const response_1 = require("../../utils/response");
const auth_service_1 = __importDefault(require("./auth.service"));
const http_error_1 = require("../../utils/http-error");
const jwt_1 = require("../../utils/jwt");
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await auth_service_1.default.authenticate(email, password);
        if (!user)
            throw new http_error_1.HttpError('Credenciales inválidas', 401);
        const { id, nombre, correo } = user;
        const token = (0, jwt_1.generateToken)({ id, correo });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ id, correo });
        return (0, response_1.successResponse)(res, { token, refreshToken, user: { id, nombre, correo } }, 'Inicio de sesión exitoso');
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const register = async (req, res, next) => {
    try {
        const { nombre: name, email, password } = req.body;
        const user = await auth_service_1.default.register(name, email, password);
        // Limpiar campos sensibles
        const { id, nombre, correo } = user;
        const token = (0, jwt_1.generateToken)({ id, correo });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ id, correo });
        return (0, response_1.successResponse)(res, { token, refreshToken, user: { id, nombre, correo } }, 'Registro exitoso', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const logout = async (req, res) => {
    return (0, response_1.successResponse)(res, null, 'Sesión cerrada correctamente');
};
exports.logout = logout;
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new http_error_1.HttpError('Token de actualización requerido', 400);
        }
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        // 🔧 Incluir `correo` en el nuevo token
        const newAccessToken = (0, jwt_1.generateToken)({ id: payload.id, correo: payload.correo });
        return (0, response_1.successResponse)(res, {
            accessToken: newAccessToken,
            refreshToken,
        }, 'Token renovado');
    }
    catch (err) {
        next(err);
    }
};
exports.refreshToken = refreshToken;
