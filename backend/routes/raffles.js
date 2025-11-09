import express from 'express';
import {
  getRaffles,
  getRaffleById
} from '../controllers/raffleController.js';

const router = express.Router();

// Rutas públicas
router.get('/', getRaffles);
router.get('/:id', getRaffleById);

export default router;

