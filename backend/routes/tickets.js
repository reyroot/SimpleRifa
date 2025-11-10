import express from 'express';
import { getMyTickets, requestOTP } from '../controllers/ticketController.js';

const router = express.Router();

router.get('/my-tickets', getMyTickets);
router.post('/request-otp', requestOTP);

export default router;

