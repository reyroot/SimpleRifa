import Ticket from '../models/Ticket.js';

export const getMyTickets = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Parámetro email requerido' });
    }
    
    const tickets = await Ticket.find({ ownerEmail: email.toLowerCase() })
      .populate('raffle')
      .populate('order')
      .sort({ createdAt: -1 });
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

