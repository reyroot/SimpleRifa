import express from 'express';
import { body } from 'express-validator';
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
} from '../controllers/paymentMethodController.js';

const router = express.Router();

// Todas estas rutas requieren admin (middleware aplicado en index.js)
router.get('/', (req, res, next) => {
  req.query.admin = true;
  next();
}, getPaymentMethods);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('El nombre es requerido')
  ],
  createPaymentMethod
);

router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío')
  ],
  updatePaymentMethod
);

router.delete('/:id', deletePaymentMethod);

export default router;

