import bcrypt from 'bcrypt';
import User from '../user/user.model';
import { ValidationAppError } from '../../utils/validation-error';

const authenticate = async (email: string, password: string) => {
  const user = await User.findOne({ where: { correo: email } });

  if (!user) {
    throw new ValidationAppError([
      { field: 'email', message: 'Usuario no encontrado' }
    ]);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ValidationAppError([
      { field: 'password', message: 'Contraseña incorrecta' }
    ]);
  }

  return user;
};

const register = async (name: string, email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await User.findOne({ where: { correo: email } });
  if (existingUser) {
    throw new ValidationAppError([
      { field: 'email', message: 'Ya existe un usuario con este correo' }
    ]);

  }

  const user = await User.create({
    nombre: name,
    correo: email,
    password: hashedPassword,
  });

  return user;
};

export default {
  authenticate,
  register,
};
