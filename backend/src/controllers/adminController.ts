import { Response } from 'express';
import { adminService } from '../services/adminService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: 'Please provide a status' });
      return;
    }

    const updatedOrder = await adminService.updateOrderStatus(req.params.id, status);
    res.status(200).json(updatedOrder);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getSalesReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const report = await adminService.getSalesReport();
    res.status(200).json({ data: report });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch sales report' });
  }
};

export const refreshSalesReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await adminService.triggerReportRefresh();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to refresh sales report' });
  }
};