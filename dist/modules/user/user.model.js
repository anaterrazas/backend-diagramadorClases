"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../config/database"));
class User extends sequelize_1.Model {
}
User.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    correo: { type: sequelize_1.DataTypes.STRING(255), allowNull: false, unique: true },
    token: { type: sequelize_1.DataTypes.STRING(255), allowNull: true, unique: true },
    password: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    createdAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
    updatedAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
}, { sequelize: database_1.default, tableName: 'users', timestamps: true });
exports.default = User;
