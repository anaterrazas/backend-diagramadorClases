"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, DATABASE_HOST, DATABASE_PORT, } = process.env;
if (!DATABASE_NAME || !DATABASE_USER || !DATABASE_PASSWORD || !DATABASE_HOST) {
    throw new Error("Faltan variables de entorno para configurar Sequelize");
}
const isProd = process.env.NODE_ENV === "production";
const sequelize = new sequelize_1.Sequelize(DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD, {
    host: DATABASE_HOST,
    port: Number(DATABASE_PORT || 5432),
    dialect: "postgres",
    logging: false,
    dialectOptions: isProd
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {}, // ✅ local sin SSL
});
exports.default = sequelize;
