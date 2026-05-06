import { Router } from 'express';
import roleController from '../controllers/roleController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
// import { requireRole } from '../middlewares/rbacMiddleware.js';

const router = Router();

// Todas las rutas de roles requieren autenticación obligatoria
router.use(requireAuth);

// Nota: En la próxima fase protegeremos estos endpoints con requireRole(['Admin'])
// Por ahora los dejamos solo con requireAuth para permitir su testeo antes de asignar roles a los usuarios.
router.post('/', roleController.createRole);
router.get('/', roleController.getRoles);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);

export default router;
