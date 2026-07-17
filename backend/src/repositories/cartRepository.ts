import { prisma } from '../utils/prisma';

export const cartRepository = {
  // We use include to deeply fetch the cart items AND the product details inside them
  async findCartByUserId(userId: string) {
    return prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, stock: true },
            },
          },
          orderBy: { productId: 'asc' }, // Keeps the cart UI stable
        },
      },
    });
  },

  async upsertCartItem(cartId: string, productId: string, quantity: number) {
    return prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId,
        productId,
        quantity,
      },
    });
  },

  async updateItemQuantity(cartId: string, productId: string, quantity: number) {
    return prisma.cartItem.update({
      where: {
        cartId_productId: { cartId, productId },
      },
      data: { quantity },
    });
  },

  async removeCartItem(cartId: string, productId: string) {
    return prisma.cartItem.delete({
      where: {
        cartId_productId: { cartId, productId },
      },
    });
  },
};