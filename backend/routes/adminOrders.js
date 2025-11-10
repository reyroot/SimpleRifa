import express from 'express';
import {
  getOrders,
  approveOrder,
  cancelOrder,
  deleteOrder
} from '../controllers/orderController.js';

const router = express.Router();

// Todas estas rutas requieren admin (middleware aplicado en index.js)
router.get('/', getOrders);
router.post('/:id/approve', approveOrder);
router.post('/:id/cancel', cancelOrder);
router.delete('/:id', deleteOrder);

export default router;

