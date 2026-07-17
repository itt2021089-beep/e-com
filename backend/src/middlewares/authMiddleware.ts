import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { userRepository } from '../repositories/userRepository';

// Extend the Express Request to include our authenticated user
export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ error: 'Not authorized to access this route' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    const user = await userRepository.findById(decoded.id);

    if (!user) {
      res.status(401).json({ error: 'User no longer exists' });
      return;
    }

    req.user = user; // Attach user payload to the request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is invalid or expired' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'User role is not authorized to access this route' });
      return;
    }
    next();
  };
};