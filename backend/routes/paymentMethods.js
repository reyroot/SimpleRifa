import express from 'express';
import {
  getPaymentMethods
} from '../controllers/paymentMethodController.js';

const router = express.Router();

// Ruta pública
router.get('/', (req, res, next) => {
  req.query.admin = false;
  next();
}, getPaymentMethods);

export default router;

