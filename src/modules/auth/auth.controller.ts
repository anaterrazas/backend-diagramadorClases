import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../../utils/response';
import authService from './auth.service';
import { HttpError } from '../../utils/http-error';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await authService.authenticate(email, password);
    if (!user) throw new HttpError('Credenciales inválidas', 401);

    const { id, nombre, correo } = user;
    const token = generateToken({ id, correo });
    const refreshToken = generateRefreshToken({ id, correo });

    return successResponse(
      res,
      { token, refreshToken, user: { id, nombre, correo } },
      'Inicio de sesión exitoso'
    );
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nombre: name, email, password } = req.body;

    const user = await authService.register(name, email, password);

    // Limpiar campos sensibles
    const { id, nombre, correo } = user;

    const token = generateToken({ id, correo });
    const refreshToken = generateRefreshToken({ id, correo });

    return successResponse(res, { token, refreshToken, user: { id, nombre, correo } }, 'Registro exitoso', 201);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  return successResponse(res, null, 'Sesión cerrada correctamente');
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new HttpError('Token de actualización requerido', 400);
    }

    const payload = verifyRefreshToken(refreshToken);

    // 🔧 Incluir `correo` en el nuevo token
    const newAccessToken = generateToken({ id: payload.id, correo: payload.correo });

    return successResponse(res, {
      accessToken: newAccessToken,
      refreshToken,
    }, 'Token renovado');
  } catch (err) {
    next(err);
  }
};


