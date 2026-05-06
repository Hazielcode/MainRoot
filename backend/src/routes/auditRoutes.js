import { Router } from 'express';
import auditController from '../controllers/auditController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(requireAuth);
// router.use(requireRole(['Admin', 'Auditor'])); // Fase próxima: Solo Admins y Auditores leen esto

router.get('/', auditController.getLogs);

export default router;
