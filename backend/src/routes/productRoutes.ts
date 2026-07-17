import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin-only protected routes
router.post('/', protect, authorizeRoles('ADMIN'), createProduct);
router.put('/:id', protect, authorizeRoles('ADMIN'), updateProduct);
router.delete('/:id', protect, authorizeRoles('ADMIN'), deleteProduct);

export default router;