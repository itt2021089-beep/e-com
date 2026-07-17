import { Router } from 'express';
import { checkout, getOrders, getOrderById } from '../controllers/orderController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// All order routes are protected
router.use(protect);

router.post('/checkout', checkout);
router.get('/', getOrders);
router.get('/:id', getOrderById);

export default router;