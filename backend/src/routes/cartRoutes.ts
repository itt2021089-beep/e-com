import { Router } from 'express';
import { getCart, addItem, updateItem, removeItem } from '../controllers/cartController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// Every cart route requires the user to be logged in
router.use(protect); 

router.get('/', getCart);
router.post('/items', addItem);
router.put('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);

export default router;