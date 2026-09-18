// src/modules/userSala/user-sala.service.ts
import { Transaction } from 'sequelize';
import UserSala from './userSala.model';
import Sala from '../sala/sala.model';
import User from '../user/user.model';

// Crea/activa la relación de compartido
export async function compartirSala(userId: number, salaId: number, t?: Transaction) {
  // Si el usuario es el creador, no creamos relación de compartido
  const salaDelUsuario = await Sala.findOne({
    where: { id: salaId, user_create: userId },
    transaction: t,
  });
  if (salaDelUsuario) {
    return 'El creador ya tiene acceso';
  }

  const existente = await UserSala.findOne({
    where: { user_id: userId, sala_id: salaId },
    transaction: t,
  });

  if (existente) {
    if (!existente.is_active) {
      existente.is_active = true;
      await existente.save({ transaction: t });
      return 'Relación activada';
    }
    return 'Ya estaba compartida';
  }

  return await UserSala.create(
    { user_id: userId, sala_id: salaId, is_active: true },
    { transaction: t }
  );
}

// Lista salas compartidas con un usuario
export async function obtenerSalasCompartidas(userId: number) {
  const filas = await UserSala.findAll({
    where: { user_id: userId, is_active: true },
    include: [
      {
        model: Sala,
        as: 'sala',
        attributes: ['id', 'title', 'description'],
        include: [{ model: User, as: 'creador', attributes: ['nombre'] }],
      },
    ],
    raw: true,
    nest: true,
  });

  // Pojo limpio para el frontend
  return filas.map((f: any) => ({
    id: f.sala?.id,
    title: f.sala?.title,
    description: f.sala?.description,
    creador: f.sala?.creador?.nombre,
  }));
}

// Soft delete de la relación
export async function eliminarSalaCompartida(userId: number, salaId: number, t?: Transaction) {
  const [affected] = await UserSala.update(
    { is_active: false },
    { where: { user_id: userId, sala_id: salaId }, transaction: t }
  );
  return affected > 0; // true si se desactivó
}
