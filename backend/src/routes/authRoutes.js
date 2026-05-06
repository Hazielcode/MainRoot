import { Router } from 'express';
import authController from '../controllers/authController.js';
import mfaController from '../controllers/mfaController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Endpoints de Autenticación Inicial
router.post('/register', authController.register);
router.post('/login', authController.login);

// Endpoints de Autenticación Multi-Factor (MFA / TOTP)
router.post('/mfa/setup', mfaController.setupMfa); // Devuelve el QR
router.post('/mfa/enable', mfaController.verifyAndEnableMfa); // Activa el MFA
router.post('/mfa/validate', mfaController.validateLoginMfa); // Valida el Login bloqueado por MFA

// Endpoint Protegido (Solo para probar el Shield / Middleware)
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({
    message: '🛡️ Acceso concedido al área segura. JWT Validado.',
    userData: req.user // Retorna los claims del token interceptados por el middleware
  });
});

export default router;
