import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Please provide email and password' });
      return;
    }

    const data = await authService.register(email, password);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Please provide email and password' });
      return;
    }

    const data = await authService.login(email, password);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  // req.user is populated by the 'protect' middleware
  res.status(200).json({ user: req.user });
};