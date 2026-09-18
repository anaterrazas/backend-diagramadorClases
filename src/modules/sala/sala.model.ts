// src/modules/sala/sala.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';
import User from '../../modules/user/user.model';

export interface SalaAttributes {
  id: number;
  title: string;
  description?: string | null;
  diagram?: any | null;
  is_active: boolean;
  user_create?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SalaCreationAttributes = Optional<
  SalaAttributes,
  'id' | 'description' | 'diagram' | 'is_active' | 'user_create' | 'createdAt' | 'updatedAt'
>;

class Sala extends Model<SalaAttributes, SalaCreationAttributes> implements SalaAttributes {
  public id!: number;
  public title!: string;
  public description!: string | null;
  public diagram!: any | null;
  public is_active!: boolean;
  public user_create!: number | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Sala.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    diagram: { type: DataTypes.JSON, allowNull: true },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    user_create: { type: DataTypes.INTEGER, allowNull: true },
    createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updatedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'salas', modelName: 'Sala', timestamps: true }
);

Sala.belongsTo(User, { as: 'creador', foreignKey: 'user_create' });

export default Sala;
