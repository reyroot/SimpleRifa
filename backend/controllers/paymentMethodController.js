import { validationResult } from 'express-validator';
import PaymentMethod from '../models/PaymentMethod.js';

export const getPaymentMethods = async (req, res) => {
  try {
    const filter = req.query.admin ? {} : { isActive: true };
    const paymentMethods = await PaymentMethod.find(filter).sort({ createdAt: -1 });
    res.json(paymentMethods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPaymentMethod = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const paymentMethod = new PaymentMethod(req.body);
    await paymentMethod.save();
    res.status(201).json(paymentMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePaymentMethod = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }
    
    res.json(paymentMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deletePaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findByIdAndDelete(req.params.id);
    
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Método de pago no encontrado' });
    }
    
    res.json({ message: 'Método de pago eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

