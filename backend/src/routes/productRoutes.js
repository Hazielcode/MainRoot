import { Router } from 'express';
import productController from '../controllers/productController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/rbacMiddleware.js';

const router = Router();

// El middleware intercepta y decodifica el JWT, lo cual es vital porque 
// el Controlador de Productos usa `req.user` para ejecutar las reglas ABAC.
router.use(requireAuth);

// STATS: Estadísticas para el Dashboard (Admin y Auditor)
router.get('/stats', requireRole(['Admin', 'Auditor', 'Gerente']), productController.getStats);

// READ: Admin, Gerente, Empleado y Auditor pueden consultar productos (el ABAC filtra por tienda)
router.get('/', requireRole(['Admin', 'Gerente', 'Empleado', 'Auditor']), productController.getProducts);

// CREATE: Admin, Gerente y Empleado pueden crear productos (el controller aplica reglas ABAC adicionales)
router.post('/', requireRole(['Admin', 'Gerente', 'Empleado']), productController.createProduct);

// UPDATE: Admin, Gerente y Empleado pueden actualizar (el controller restringe qué campos según rol)
router.put('/:id', requireRole(['Admin', 'Gerente', 'Empleado']), productController.updateProduct);

// DELETE: Solo Admin y Gerente pueden eliminar (el controller aplica restricción ABAC de es_premium)
router.delete('/:id', requireRole(['Admin', 'Gerente']), productController.deleteProduct);

export default router;
