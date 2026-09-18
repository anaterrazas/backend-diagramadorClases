// src/modules/userSala/user-sala.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../config/database';
import User from '../user/user.model';
import Sala from '../sala/sala.model';

// Atributos que existen en la tabla
export interface UserSalaAttributes {
  user_id: number;
  sala_id: number;
  is_active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Atributos opcionales al crear
export type UserSalaCreationAttributes = Optional<UserSalaAttributes, 'is_active' | 'createdAt' | 'updatedAt'>;

class UserSala extends Model<UserSalaAttributes, UserSalaCreationAttributes>
  implements UserSalaAttributes {
  public user_id!: number;
  public sala_id!: number;
  public is_active!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Inicialización
UserSala.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
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
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users_sala',
    modelName: 'UserSala',
    timestamps: true, // Sequelize manejará createdAt / updatedAt
  }
);

// Relaciones
UserSala.belongsTo(User, { foreignKey: 'user_id', as: 'usuario' });
UserSala.belongsTo(Sala, { foreignKey: 'sala_id', as: 'sala' });

User.belongsToMany(Sala, {
  through: UserSala,
  foreignKey: 'user_id',
  otherKey: 'sala_id',
  as: 'salasCompartidas',
});
Sala.belongsToMany(User, {
  through: UserSala,
  foreignKey: 'sala_id',
  otherKey: 'user_id',
  as: 'usuariosCompartidos',
});

export default UserSala;
