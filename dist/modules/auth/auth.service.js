"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../user/user.model"));
const validation_error_1 = require("../../utils/validation-error");
const authenticate = async (email, password) => {
    const user = await user_model_1.default.findOne({ where: { correo: email } });
    if (!user) {
        throw new validation_error_1.ValidationAppError([
            { field: 'email', message: 'Usuario no encontrado' }
        ]);
    }
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new validation_error_1.ValidationAppError([
            { field: 'password', message: 'Contraseña incorrecta' }
        ]);
    }
    return user;
};
const register = async (name, email, password) => {
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const existingUser = await user_model_1.default.findOne({ where: { correo: email } });
    if (existingUser) {
        throw new validation_error_1.ValidationAppError([
            { field: 'email', message: 'Ya existe un usuario con este correo' }
        ]);
    }
    const user = await user_model_1.default.create({
        nombre: name,
        correo: email,
        password: hashedPassword,
    });
    return user;
};
exports.default = {
    authenticate,
    register,
};
