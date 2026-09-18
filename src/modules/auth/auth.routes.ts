import { Router } from 'express';
import { login, register, logout, refreshToken } from './auth.controller';
import { signInValidator, signUpValidator } from './auth.validator';
import { validateRequest } from '../../middlewares/validate';

const router = Router();

router.post('/login', signInValidator, validateRequest, login);
router.post('/register', signUpValidator, validateRequest, register);
router.post('/logout', logout); // simbólico, ya que JWT es stateless
router.post('/refresh-token', refreshToken);
export default router;


