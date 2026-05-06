import { Router } from 'express';
import storeController from '../controllers/storeController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Endpoints protegidos, requeridos para la base del ABAC Geográfico
router.use(requireAuth);

router.post('/', storeController.createStore);
router.get('/', storeController.getStores);
router.put('/:id', storeController.updateStore);
router.delete('/:id', storeController.deleteStore);

export default router;
