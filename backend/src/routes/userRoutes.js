import { Router } from 'express';
import userController from '../controllers/userController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/rbacMiddleware.js';

const router = Router();

// Todo el módulo de gestión de personal requiere autenticación
router.use(requireAuth);

// Solo Administradores pueden gestionar al personal
router.use(requireRole(['Admin']));

// Obtener la lista completa de personal y sus roles
router.get('/', userController.getAllUsers);

// Estadísticas rápidas para el Dashboard
router.get('/stats', userController.getStats);

// Asignar un rol a un usuario (Ej: Dar rol 'Gerente' al empleado 5)
router.post('/:id/roles', userController.assignRoleToUser);

// Revocar un rol de un usuario (Ej: Quitar rol 'Empleado' del usuario 5)
router.delete('/:id/roles/:rolId', userController.revokeRoleFromUser);

// Activar/Desactivar cuenta (Soft Delete para cumplir con la política Zero Trust y auditoría)
router.patch('/:id/status', userController.toggleUserStatus);

export default router;
