import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

class AuthService {
  async register(data) {
    const { email, password, nombre_completo, tienda_id } = data;

    // 1. Validaciones básicas
    if (!email || !password || !nombre_completo) {
      throw new Error('Email, password y nombre completo son obligatorios.');
    }

    // Validación de complejidad de contraseña Corporativa (Mínimo 8 chars, 1 mayúscula, 1 número, 1 carácter especial)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error('La contraseña no cumple con los requisitos de seguridad corporativa.');
    }

    // 2. Verificar si el usuario ya existe para prevenir duplicados
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado.');
    }

    // 3. Hashear la contraseña con bcrypt (Nivel de seguridad 12)
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 4. Crear usuario en la Base de Datos
    const newUser = await userModel.create({
      email,
      password_hash,
      nombre_completo,
      tienda_id
    });

    return newUser;
  }

  async login(email, password) {
    // 1. Verificar si el usuario existe
    const user = await userModel.findByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas.');
    }

    if (!user.activo) {
      throw new Error('La cuenta de usuario está desactivada.');
    }

    // 2. Verificar que la contraseña coincide
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas.');
    }

    // 3. Evaluar el estado del MFA (Multi-Factor Authentication)
    if (user.mfa_habilitado) {
      // El MFA está activo, devolver un reto de MFA en lugar del JWT completo
      return { mfaRequired: true, userId: user.id, email: user.email };
    }

    // 4. Si no hay MFA habilitado (o es login inicial), generar JWT
    const payload = {
      userId: user.id,
      email: user.email,
      tiendaId: user.tienda_id
      // Nota: El Rol se inyectará en la siguiente fase de RBAC
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Excluimos datos sensibles de la respuesta
    const userProfile = {
      id: user.id,
      email: user.email,
      nombre_completo: user.nombre_completo,
      tienda_id: user.tienda_id
    };

    return { mfaRequired: false, token, user: userProfile };
  }
}

export default new AuthService();
