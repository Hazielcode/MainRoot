import { Router } from 'express';
import productController from '../controllers/productController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// El middleware intercepta y decodifica el JWT, lo cual es vital porque 
// el Controlador de Productos usa `req.user` para ejecutar las reglas ABAC.
router.use(requireAuth);

router.post('/', productController.createProduct);
router.get('/', productController.getProducts);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
