"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/sala/sala.model.ts
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../config/database"));
const user_model_1 = __importDefault(require("../../modules/user/user.model"));
class Sala extends sequelize_1.Model {
}
Sala.init({
    id: { type: sequelize_1.DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: sequelize_1.DataTypes.STRING(255), allowNull: false },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: true },
    diagram: { type: sequelize_1.DataTypes.JSON, allowNull: true },
    is_active: { type: sequelize_1.DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    user_create: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    createdAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
    updatedAt: { type: sequelize_1.DataTypes.DATE, allowNull: false, defaultValue: sequelize_1.DataTypes.NOW },
}, { sequelize: database_1.default, tableName: 'salas', modelName: 'Sala', timestamps: true });
Sala.belongsTo(user_model_1.default, { as: 'creador', foreignKey: 'user_create' });
exports.default = Sala;
