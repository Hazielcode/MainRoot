import { Router } from 'express';
import authController from '../controllers/authController.js';
import mfaController from '../controllers/mfaController.js';

const router = Router();

// Endpoints de Autenticación Inicial
router.post('/register', authController.register);
router.post('/login', authController.login);

// Endpoints de Autenticación Multi-Factor (MFA / TOTP)
router.post('/mfa/setup', mfaController.setupMfa); // Devuelve el QR
router.post('/mfa/enable', mfaController.verifyAndEnableMfa); // Activa el MFA
router.post('/mfa/validate', mfaController.validateLoginMfa); // Valida el Login bloqueado por MFA

export default router;
