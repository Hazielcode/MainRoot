import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Contadores de intentos fallidos en memoria (Rate Limiting simple)
// En producción esto iría en Redis (§10.3 del roadmap)
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

class AuthService {
  async register(data) {
    const { email, password, nombres, apellidos, telefono, fecha_nacimiento, tienda_id } = data;

    if (!email || !password || !nombres || !apellidos) {
      throw new Error('Email, password, nombres y apellidos son obligatorios.');
    }

    // Validación de complejidad de contraseña Corporativa (Mínimo 8 chars, 1 mayúscula, 1 número, 1 carácter especial)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error('La contraseña no cumple con los requisitos de seguridad corporativa.');
    }

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      throw new Error('El correo electrónico ya está registrado.');
    }

    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const newUser = await userModel.create({
      email,
      password_hash,
      nombres,
      apellidos,
      telefono,
      fecha_nacimiento,
      tienda_id
    });

    return newUser;
  }

  async login(email, password) {
    // === RATE LIMITING / ACCOUNT LOCKOUT (§3.2 del roadmap) ===
    const attemptKey = email.toLowerCase();
    const record = loginAttempts.get(attemptKey);

    if (record && record.count >= MAX_LOGIN_ATTEMPTS) {
      const timeSinceLock = Date.now() - record.lockedAt;
      if (timeSinceLock < LOCKOUT_DURATION_MS) {
        const minutesLeft = Math.ceil((LOCKOUT_DURATION_MS - timeSinceLock) / 60000);
        throw new Error(`Cuenta bloqueada temporalmente por ${minutesLeft} minuto(s). Demasiados intentos fallidos.`);
      } else {
        // Expiró el bloqueo, resetear
        loginAttempts.delete(attemptKey);
      }
    }

    // 1. Verificar si el usuario existe
    const user = await userModel.findByEmail(email);
    if (!user) {
      this._registerFailedAttempt(attemptKey);
      throw new Error('Credenciales inválidas.');
    }

    if (!user.activo) {
      throw new Error('La cuenta de usuario está desactivada.');
    }

    // 2. Verificar que la contraseña coincide
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      this._registerFailedAttempt(attemptKey);
      throw new Error('Credenciales inválidas.');
    }

    // Login exitoso → resetear intentos
    loginAttempts.delete(attemptKey);

    // 3. Generar JWT CON ROLES inyectados y evaluar MFA
    const roles = await userModel.getRolesByUserId(user.id);
    const isAdmin = roles.includes('Admin');

    // Bypass MFA check if the user is an Admin
    if (user.mfa_habilitado && !isAdmin) {
      return { mfaRequired: true, userId: user.id, email: user.email };
    }

    const payload = {
      userId: user.id,
      email: user.email,
      tiendaId: user.tienda_id,
      roles: roles // ← CRÍTICO: El middleware RBAC lee esto
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    const userProfile = {
      id: user.id,
      email: user.email,
      nombres: user.nombres,
      apellidos: user.apellidos,
      nombre_completo: `${user.nombres} ${user.apellidos}`.trim(),
      telefono: user.telefono,
      fecha_nacimiento: user.fecha_nacimiento,
      tienda_id: user.tienda_id,
      roles: roles
    };

    return { mfaRequired: false, token, user: userProfile };
  }

  // Registrar un intento fallido de login
  _registerFailedAttempt(key) {
    const record = loginAttempts.get(key) || { count: 0, lockedAt: null };
    record.count += 1;
    if (record.count >= MAX_LOGIN_ATTEMPTS) {
      record.lockedAt = Date.now();
    }
    loginAttempts.set(key, record);
  }
}

export default new AuthService();
