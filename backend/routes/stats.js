import express from 'express';
import { getTopBuyers } from '../controllers/statsController.js';

const router = express.Router();

router.get('/top-buyers', getTopBuyers);

export default router;

