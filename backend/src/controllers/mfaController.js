import { generateMfaSecret, generateQRCodeDataURL, verifyMfaToken } from '../utils/mfaUtils.js';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

class MfaController {
  // Generar secreto y código QR para un usuario (Primer paso para configurar MFA)
  async setupMfa(req, res) {
    try {
      const { userId, email } = req.body; 

      const { secret, otpauthUrl } = generateMfaSecret(email);
      const qrCodeDataUrl = await generateQRCodeDataURL(otpauthUrl);

      // Guardar el secreto temporalmente en la BD (aún sin obligar MFA, hasta que lo verifique)
      await userModel.updateMfa(userId, secret, false);

      res.status(200).json({
        message: 'MFA setup iniciado. Escanee el código QR con Google Authenticator.',
        secret, 
        qrCode: qrCodeDataUrl
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Verificar el primer código ingresado por el usuario para ACTIVAR el MFA
  async verifyAndEnableMfa(req, res) {
    try {
      const { userId, token } = req.body; // El token de 6 dígitos

      const user = await userModel.findById(userId);
      if (!user) throw new Error('Usuario no encontrado');
      if (!user.mfa_secret) throw new Error('MFA no ha sido configurado. Solicite el setup primero.');

      const isValid = verifyMfaToken(token, user.mfa_secret);

      if (!isValid) {
        return res.status(401).json({ error: 'Código TOTP inválido o expirado' });
      }

      // El código fue correcto, encendemos el MFA definitivamente
      await userModel.updateMfa(userId, user.mfa_secret, true);

      res.status(200).json({ message: 'Autenticación Multi-Factor habilitada con éxito en su cuenta.' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Para el flujo de Login: Valida el código TOTP tras un inicio de sesión que requiere MFA
  async validateLoginMfa(req, res) {
    try {
      const { userId, token } = req.body;

      const user = await userModel.findById(userId);
      if (!user || !user.mfa_habilitado) {
         return res.status(400).json({ error: 'Usuario no válido o MFA no está activo en esta cuenta.' });
      }

      const isValid = verifyMfaToken(token, user.mfa_secret);

      if (!isValid) {
        return res.status(401).json({ error: 'Código TOTP inválido o expirado' });
      }

      // Pasó el MFA: Emitir el JWT definitivo para entrar al sistema
      const payload = { userId: user.id, email: user.email, tiendaId: user.tienda_id };
      const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

      res.status(200).json({
        message: 'MFA validado. Acceso concedido al sistema.',
        token: jwtToken
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new MfaController();
