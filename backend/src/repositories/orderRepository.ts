import { prisma } from '../utils/prisma';
import { Prisma } from '@prisma/client';

export const orderRepository = {
  async findByIdempotencyKey(key: string) {
    return prisma.order.findUnique({
      where: { idempotencyKey: key },
      include: { items: true },
    });
  },

  // The "Crown Jewel" Transaction
  async executeCheckoutTransaction(userId: string, cart: any, totalAmount: number, idempotencyKey: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Lock the product rows to prevent race conditions (SELECT FOR UPDATE)
      for (const item of cart.items) {
        await tx.$queryRaw`SELECT id FROM "products" WHERE id = ${item.productId} FOR UPDATE`;
      }

      // 2. Verify stock again (now that rows are securely locked)
      for (const item of cart.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`Out of stock: ${item.product.name} only has ${product?.stock || 0} units left.`);
        }
      }

      // 3. Create the Order
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          idempotencyKey,
          status: 'PAID', // In a real app, this would be PENDING until Stripe/Payment succeeds
        },
      });

      // 4. Create OrderItems (Snapshotting price and name)
      const orderItemsData = cart.items.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
      }));
      await tx.orderItem.createMany({ data: orderItemsData });

      // 5. Decrement Product Stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 6. Empty the User's Cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });
    });
  },

  async findOrders(whereClause: Prisma.OrderWhereInput, skip: number, take: number) {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.order.count({ where: whereClause }),
    ]);
    return { orders, total };
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }
};