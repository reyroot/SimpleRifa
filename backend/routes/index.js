import express from 'express';
import raffleRoutes from './raffles.js';
import orderRoutes from './orders.js';
import paymentMethodRoutes from './paymentMethods.js';
import ticketRoutes from './tickets.js';
import adminRoutes from './admin.js';
import adminRaffleRoutes from './adminRaffles.js';
import adminOrderRoutes from './adminOrders.js';
import adminPaymentMethodRoutes from './adminPaymentMethods.js';
import configRoutes from './config.js';
import { adminCheck } from '../middleware/adminCheck.js';

const router = express.Router();

// Rutas públicas
router.use('/raffles', raffleRoutes);
router.use('/orders', orderRoutes);
router.use('/payment-methods', paymentMethodRoutes);
router.use('/tickets', ticketRoutes);
router.use('/config', configRoutes);
router.use('/admin', adminRoutes);

// Rutas admin (protegidas)
router.use('/admin/raffles', adminCheck, adminRaffleRoutes);
router.use('/admin/orders', adminCheck, adminOrderRoutes);
router.use('/admin/payment-methods', adminCheck, adminPaymentMethodRoutes);
router.use('/admin/config', adminCheck, configRoutes);

export default router;

