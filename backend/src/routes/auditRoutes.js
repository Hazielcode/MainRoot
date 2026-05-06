import { Router } from 'express';
import auditController from '../controllers/auditController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/rbacMiddleware.js';

const router = Router();

router.use(requireAuth);

// Solo Administradores y Auditores pueden consultar los logs del sistema
router.get('/', requireRole(['Admin', 'Auditor']), auditController.getLogs);

export default router;
