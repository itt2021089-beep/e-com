import { Router } from 'express';
import { updateOrderStatus, getSalesReport, refreshSalesReport } from '../controllers/adminController';
import { protect, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// EVERY route here requires the user to be logged in AND have the ADMIN role
router.use(protect);
router.use(authorizeRoles('ADMIN'));

// Order Management
router.put('/orders/:id/status', updateOrderStatus);

// Dashboard Reporting
router.get('/reports/sales', getSalesReport);
router.post('/reports/sales/refresh', refreshSalesReport);

export default router;