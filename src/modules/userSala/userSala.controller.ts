// src/controllers/userSala.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as userSalaService from './userSala.service';
import { successResponse } from '../../utils/response';
import { HttpError } from '../../utils/http-error';

export const indexSalasCompartidas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new HttpError('Usuario no autenticado', 401);

    const salas = await userSalaService.obtenerSalasCompartidas(userId);
    return successResponse(res, salas, 'Salas compartidas obtenidas');
  } catch (error) {
    next(error);
  }
};

export const compartir = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("ENTRO")
    const userId = req.user?.id;
    const salaId = Number(req.params.id);
    if (!userId || !salaId) throw new HttpError('Datos inválidos', 400);

    await userSalaService.compartirSala(userId, salaId);
    return successResponse(res, null, 'Sala compartida exitosamente');
  } catch (error) {
    next(error);
  }
};

export const deleteSalaCompartida = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const salaId = Number(req.params.id);
    if (!userId || !salaId) throw new HttpError('Datos inválidos', 400);

    await userSalaService.eliminarSalaCompartida(userId, salaId);
    return successResponse(res, null, 'Sala compartida eliminada');
  } catch (error) {
    next(error);
  }
};
