import { userRepository } from '../repositories/userRepository';
import { hashPassword, comparePasswords } from '../utils/hash';
import { generateToken } from '../utils/jwt';

export const authService = {
  async register(email: string, passwordPlain: string) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email is already in use');
    }

    const passwordHash = await hashPassword(passwordPlain);
    
    // Create user and cart
    const user = await userRepository.createWithCart({
      email,
      passwordHash
    });

    const token = generateToken({ id: user.id, role: user.role });
    return { user, token };
  },

  async login(email: string, passwordPlain: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await comparePasswords(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({ id: user.id, role: user.role });
    
    // Strip the password before returning to the controller
    const { passwordHash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
};