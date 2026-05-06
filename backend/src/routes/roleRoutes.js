import { Router } from 'express';
import roleController from '../controllers/roleController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/rbacMiddleware.js';

const router = Router();

// Todas las rutas de roles requieren autenticación obligatoria
router.use(requireAuth);

// READ: Cualquier usuario autenticado puede consultar los roles (para poblar selects en la UI)
router.get('/', roleController.getRoles);

// CREATE, UPDATE, DELETE: Solo el Administrador puede gestionar roles
router.post('/', requireRole(['Admin']), roleController.createRole);
router.put('/:id', requireRole(['Admin']), roleController.updateRole);
router.delete('/:id', requireRole(['Admin']), roleController.deleteRole);

export default router;
