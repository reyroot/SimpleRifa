import express from 'express';
import { login, drawRaffle, getWinners } from '../controllers/adminController.js';
import { adminCheck } from '../middleware/adminCheck.js';

const router = express.Router();

router.post('/login', login);
router.post('/raffles/:id/draw', adminCheck, drawRaffle);
router.get('/winners', adminCheck, getWinners);

export default router;

