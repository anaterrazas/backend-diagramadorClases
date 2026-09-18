// sala.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as salaService from './sala.service';
import { successResponse } from '../../utils/response';
import { HttpError } from '../../utils/http-error';

export const getSalas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new HttpError('Usuario no autenticado', 401);
    const salas = await salaService.getAllSalasByUser(userId);
    return successResponse(res, salas, 'Salas obtenidas');
  } catch (error) {
    next(error);
  }
};

export const createSala = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new HttpError('Usuario no autenticado', 401);
    const { title, description } = req.body;
    const id = await salaService.createSala(title, description, userId);
    return successResponse(res, { id }, 'Sala creada', 201);
  } catch (error) {
    next(error);
  }
};

export const updateSala = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;
    const salaId = parseInt(req.params.id);
    await salaService.updateSala(salaId, title, description);
    return successResponse(res, null, 'Sala actualizada');
  } catch (error) {
    next(error);
  }
};

export const deleteSala = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const salaId = parseInt(req.params.id);
    await salaService.deleteSala(salaId);
    return successResponse(res, null, 'Sala eliminada');
  } catch (error) {
    next(error);
  }
};

export const importImg = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new HttpError('No se envió ninguna imagen.', 400);
    const aiDesign = await salaService.generateHtmlCssFromImage(req.file);
    return successResponse(res, { aiDesign }, 'Diagrama generado con IA');
  } catch (error) {
    next(error);
  }
};
