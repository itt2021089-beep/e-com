import { Response } from 'express';
import { cartService } from '../services/cartService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getCart = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cart = await cartService.getMyCart(req.user!.id);
    res.status(200).json(cart);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const addItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || quantity === undefined) {
      res.status(400).json({ error: 'Please provide productId and quantity' });
      return;
    }

    const updatedCart = await cartService.addItemToCart(req.user!.id, productId, quantity);
    res.status(200).json(updatedCart);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;
    
    if (quantity === undefined) {
      res.status(400).json({ error: 'Please provide quantity' });
      return;
    }

    const updatedCart = await cartService.updateItemQuantity(req.user!.id, productId, quantity);
    res.status(200).json(updatedCart);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const removeItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const updatedCart = await cartService.removeItemFromCart(req.user!.id, productId);
    res.status(200).json(updatedCart);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};