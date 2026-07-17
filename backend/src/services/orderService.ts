import { orderRepository } from '../repositories/orderRepository';
import { cartRepository } from '../repositories/cartRepository';

export const orderService = {
  async processCheckout(userId: string, idempotencyKey: string) {
    // 1. Check Idempotency Cache (Did they just double-click the button?)
    const existingOrder = await orderRepository.findByIdempotencyKey(idempotencyKey);
    if (existingOrder) {
      return existingOrder; // Return cached success
    }

    // 2. Fetch User Cart
    const cart = await cartRepository.findCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new Error('Your cart is empty');
    }

    // 3. Calculate strict server-side total
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + (Number(item.product.price) * item.quantity);
    }, 0);

    // 4. Execute the secure database transaction
    return orderRepository.executeCheckoutTransaction(userId, cart, totalAmount, idempotencyKey);
  },

  async getOrders(userId: string, role: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    // CUSTOMER only sees their orders. ADMIN sees all orders.
    const whereClause = role === 'ADMIN' ? {} : { userId };
    
    const { orders, total } = await orderRepository.findOrders(whereClause, skip, limit);
    return {
      data: orders,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  },

  async getOrderById(orderId: string, userId: string, role: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');

    // Security Check: Customer can't view another customer's order
    if (role !== 'ADMIN' && order.userId !== userId) {
      throw new Error('Unauthorized access to this order');
    }

    return order;
  }
};