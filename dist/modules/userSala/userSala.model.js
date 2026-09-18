"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/userSala/user-sala.model.ts
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../../config/database"));
const user_model_1 = __importDefault(require("../user/user.model"));
const sala_model_1 = __importDefault(require("../sala/sala.model"));
class UserSala extends sequelize_1.Model {
}
// Inicialización
UserSala.init({
    user_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    sala_id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: 'salas',
            key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    },
    is_active: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.default,
    tableName: 'users_sala',
    modelName: 'UserSala',
    timestamps: true, // Sequelize manejará createdAt / updatedAt
});
// Relaciones
UserSala.belongsTo(user_model_1.default, { foreignKey: 'user_id', as: 'usuario' });
UserSala.belongsTo(sala_model_1.default, { foreignKey: 'sala_id', as: 'sala' });
user_model_1.default.belongsToMany(sala_model_1.default, {
    through: UserSala,
    foreignKey: 'user_id',
    otherKey: 'sala_id',
    as: 'salasCompartidas',
});
sala_model_1.default.belongsToMany(user_model_1.default, {
    through: UserSala,
    foreignKey: 'sala_id',
    otherKey: 'user_id',
    as: 'usuariosCompartidos',
});
exports.default = UserSala;
