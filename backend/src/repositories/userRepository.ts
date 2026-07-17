import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const userRepository = {
  // Creates a User and an empty Cart simultaneously
  async createWithCart(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data: {
        ...data,
        cart: {
          create: {} // Generates the 1:1 Cart instantly
        }
      },
      select: { id: true, email: true, role: true, createdAt: true } // Excludes passwordHash
    });
  },

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, createdAt: true } // Excludes passwordHash
    });
  }
};