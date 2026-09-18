// src/routes/salaRoutes.ts
import { Router } from 'express';
import multer from 'multer';
import * as salaController from './sala.controller';
import { createValidator } from './sala.validator';
import { validateRequest } from '../../middlewares/validate';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Rutas protegidas con JWT
router.get('/', salaController.getSalas);               // GET /salas
router.post('/', createValidator, validateRequest, salaController.createSala);            // POST /salas
router.put('/:id', validateRequest, salaController.updateSala);          // PUT /salas/:id
router.delete('/:id', validateRequest, salaController.deleteSala);       // DELETE /salas/:id

// IA – Importar imagen
router.post('/import-img', upload.single('image'), salaController.importImg);

export default router;
