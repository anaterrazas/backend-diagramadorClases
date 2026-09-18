import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';

export interface UserAttributes {
  id: number;
  nombre: string;
  correo: string;
  password: string;
  token?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<UserAttributes, 'id' | 'token' | 'createdAt' | 'updatedAt'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public nombre!: string;
  public correo!: string;
  public password!: string;
  public token!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre: { type: DataTypes.STRING(255), allowNull: false },
    correo: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    token: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'users', timestamps: true }
);

export default User;
