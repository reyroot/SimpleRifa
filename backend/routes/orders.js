import express from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import {
  createOrder,
  uploadProof
} from '../controllers/orderController.js';

const router = express.Router();

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Rutas públicas
router.post(
  '/',
  [
    body('raffleId').notEmpty().withMessage('raffleId es requerido'),
    body('quantity').isInt({ min: 1 }).withMessage('quantity debe ser un número mayor a 0'),
    body('buyerInfo.name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('buyerInfo.email').isEmail().withMessage('Email inválido'),
    body('buyerInfo.phone').trim().notEmpty().withMessage('El teléfono es requerido')
  ],
  createOrder
);

router.post('/:id/upload-proof', upload.single('proof'), uploadProof);

export default router;

