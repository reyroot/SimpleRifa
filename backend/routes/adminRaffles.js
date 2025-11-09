import express from 'express';
import { body } from 'express-validator';
import {
  getRaffles,
  getRaffleById,
  createRaffle,
  updateRaffle,
  deleteRaffle,
  uploadRaffleImages
} from '../controllers/raffleController.js';
import { uploadRaffleImages as uploadMiddleware } from '../middleware/uploadRaffleImages.js';

const router = express.Router();

// Todas estas rutas requieren admin (middleware aplicado en index.js)
router.get('/', getRaffles);
router.get('/:id', getRaffleById);
router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('El título es requerido'),
    body('maxNumbers').isInt({ min: 1 }).withMessage('maxNumbers debe ser un número mayor a 0'),
    body('pricePerNumber').isFloat({ min: 0 }).withMessage('pricePerNumber debe ser un número mayor o igual a 0')
  ],
  createRaffle
);
router.put(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('El título no puede estar vacío'),
    body('maxNumbers').optional().isInt({ min: 1 }).withMessage('maxNumbers debe ser un número mayor a 0'),
    body('pricePerNumber').optional().isFloat({ min: 0 }).withMessage('pricePerNumber debe ser un número mayor o igual a 0')
  ],
  updateRaffle
);
router.delete('/:id', deleteRaffle);
router.post('/:id/images', (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      // Si es un error de multer, puede ser por límite de tamaño o tipo de archivo
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 10MB por imagen.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Demasiados archivos. Máximo 10 imágenes.' });
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ error: 'Campo de archivo inesperado. Use el campo "images".' });
      }
      return res.status(400).json({ error: err.message || 'Error al procesar el archivo' });
    }
    next();
  });
}, uploadRaffleImages);

export default router;

