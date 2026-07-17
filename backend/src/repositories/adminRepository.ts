import { prisma } from '../utils/prisma';
import { OrderStatus } from '@prisma/client';

export const adminRepository = {
  async updateOrderStatus(orderId: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });
  },

  async getMaterializedSalesReport() {
    // We use $queryRaw because Prisma does not track materialized views in the schema
    return prisma.$queryRaw`SELECT * FROM admin_sales_report ORDER BY sale_date DESC LIMIT 30`;
  },

  async refreshMaterializedView() {
    // Executes the background refresh without locking the table
    await prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY admin_sales_report;`);
    return { success: true, message: 'Sales report view refreshed successfully' };
  }
};