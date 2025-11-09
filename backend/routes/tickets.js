import express from 'express';
import { getMyTickets } from '../controllers/ticketController.js';

const router = express.Router();

router.get('/my-tickets', getMyTickets);

export default router;

