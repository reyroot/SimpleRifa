import express from 'express';
import { login, drawRaffle } from '../controllers/adminController.js';
import { adminCheck } from '../middleware/adminCheck.js';

const router = express.Router();

router.post('/login', login);
router.post('/raffles/:id/draw', adminCheck, drawRaffle);

export default router;

