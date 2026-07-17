import { Response } from 'express';
import { orderService } from '../services/orderService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const checkout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const idempotencyKey = req.headers['x-idempotency-key'] as string;
    if (!idempotencyKey) {
      res.status(400).json({ error: 'X-Idempotency-Key header is required' });
      return;
    }

    const order = await orderService.processCheckout(req.user!.id, idempotencyKey);
    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await orderService.getOrders(req.user!.id, req.user!.role, page, limit);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Server error fetching orders' });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user!.id, req.user!.role);
    res.status(200).json(order);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};