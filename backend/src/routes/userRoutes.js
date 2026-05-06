import { Router } from 'express';
import userController from '../controllers/userController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
// import { requireRole } from '../middlewares/rbacMiddleware.js';

const router = Router();

// Todo este módulo es estrictamente seguro, solo usuarios validados pueden entrar
router.use(requireAuth);

// Nota: Cuando tengamos usuarios con roles asignados, descomentaremos el middleware requireRole
// para que SOLO los usuarios con el rol 'Admin' puedan gestionar al personal.
// router.use(requireRole(['Admin'])); 

// Obtener la lista completa de personal y sus roles
router.get('/', userController.getAllUsers);

// Asignar un rol a un usuario (Ej: Dar rol 'Gerente' al empleado 5)
router.post('/:id/roles', userController.assignRoleToUser);

// Activar/Desactivar cuenta (Soft Delete para cumplir con la política Zero Trust y auditoría)
router.patch('/:id/status', userController.toggleUserStatus);

export default router;
