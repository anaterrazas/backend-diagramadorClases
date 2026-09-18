"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketJWTAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const socketJWTAuth = (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        console.warn('[Socket Auth] Token no proporcionado');
        return next(new Error('Token no proporcionado'));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // ✅ Guardar en socket.data
        socket.data.user = decoded;
        console.log('[Socket Auth] Usuario autenticado:', decoded.correo);
        next();
    }
    catch (err) {
        console.error('[Socket Auth] Error al verificar token:', err.message);
        next(new Error('Token inválido o expirado'));
    }
};
exports.socketJWTAuth = socketJWTAuth;
