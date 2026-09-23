import { Router } from 'express';

// Importar rutas de módulos
import authRoutes from '../modules/auth/auth.routes';
import salaRoutes from '../modules/sala/sala.routes';
import userSalaRoutes from '../modules/userSala/userSala.routes';
import iaRoutes from '../modules/ia/ia.routes'
import codegenRoutes from '../modules/codegen/codegen.routes';
import flutterCodegenRoutes from '../modules/flutter-codegen/flutter-codegen.routes';
import { authenticateJWT } from '../middlewares/authenticate.middleware';
// Agrega aquí más rutas según crezcas

const router = Router();

// Prefijos por módulo
router.use('/auth', authRoutes);     // /api/auth/*
router.use('/salas', authenticateJWT, salaRoutes);    // /api/salas/*
router.use('/user-salas', authenticateJWT, userSalaRoutes);
router.use('/ia', iaRoutes)
router.use('/codegen', codegenRoutes)
router.use('/codegen', flutterCodegenRoutes)
export default router;
