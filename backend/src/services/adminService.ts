import { adminRepository } from '../repositories/adminRepository';
import { orderRepository } from '../repositories/orderRepository';
import { OrderStatus } from '@prisma/client';

export const adminService = {
  async updateOrderStatus(orderId: string, status: string) {
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      throw new Error(`Invalid status. Must be one of: ${Object.values(OrderStatus).join(', ')}`);
    }

    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error('Order not found');

    return adminRepository.updateOrderStatus(orderId, status as OrderStatus);
  },

  async getSalesReport() {
    const rawData = await adminRepository.getMaterializedSalesReport() as any[];

    // FIX: Convert PostgreSQL BigInt and Decimal types into standard JavaScript Numbers 
    // so Express can safely run JSON.stringify() on them without crashing.
    return rawData.map(row => ({
      sale_date: row.sale_date,
      total_orders: Number(row.total_orders), 
      total_revenue: Number(row.total_revenue)
    }));
  },

  async triggerReportRefresh() {
    return adminRepository.refreshMaterializedView();
  }
};