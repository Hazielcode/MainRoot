import { Router } from 'express';
import storeController from '../controllers/storeController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/rbacMiddleware.js';

const router = Router();

// Endpoints protegidos, requeridos para la base del ABAC Geográfico
router.use(requireAuth);

// READ: Todos los autenticados pueden ver la lista de tiendas
router.get('/', requireRole(['Admin', 'Gerente', 'Empleado', 'Auditor']), storeController.getStores);

// CREATE, UPDATE, DELETE: Solo el Administrador gestiona las sucursales
router.post('/', requireRole(['Admin']), storeController.createStore);
router.put('/:id', requireRole(['Admin']), storeController.updateStore);
router.delete('/:id', requireRole(['Admin']), storeController.deleteStore);

export default router;
