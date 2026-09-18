// src/modules/userSala/userSala.routes.ts

import { Router } from 'express';
import * as userSalaController from './userSala.controller';
import { authenticateJWT } from '../../middlewares/authenticate.middleware';

const router = Router();

router.get('/', authenticateJWT, userSalaController.indexSalasCompartidas);
router.post('/compartir/:id', authenticateJWT, userSalaController.compartir);
router.delete('/:id', authenticateJWT, userSalaController.deleteSalaCompartida);

export default router;
