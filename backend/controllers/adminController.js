import RaffleService from '../services/RaffleService.js';
import Ticket from '../models/Ticket.js';
import Order from '../models/Order.js';
import Raffle from '../models/Raffle.js';

export const login = async (req, res) => {
  try {
    const { token } = req.body;
    const expectedToken = process.env.ADMIN_SECRET_TOKEN;
    
    if (!token || token !== expectedToken) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    res.json({ 
      message: 'Login exitoso',
      token: expectedToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const drawRaffle = async (req, res) => {
  try {
    const { winningTicketNumbers } = req.body; // Array de números para sorteo manual
    const result = await RaffleService.drawWinner(req.params.id, winningTicketNumbers);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getWinners = async (req, res) => {
  try {
    const { raffleId } = req.query;
    
    // Construir filtro
    const filter = { isWinner: true };
    if (raffleId) {
      filter.raffle = raffleId;
    }
    
    // Obtener todos los tickets ganadores
    const winningTickets = await Ticket.find(filter)
      .populate('raffle', 'title')
      .populate('order', 'buyerInfo')
      .sort({ createdAt: -1 });
    
    // Agrupar por email para mostrar información del comprador
    const winnersMap = {};
    winningTickets.forEach(ticket => {
      const email = ticket.ownerEmail;
      if (!winnersMap[email]) {
        winnersMap[email] = {
          email,
          name: ticket.order?.buyerInfo?.name || 'N/A',
          phone: ticket.order?.buyerInfo?.phone || 'N/A',
          raffle: ticket.raffle,
          winningNumbers: [],
          orderId: ticket.order?._id
        };
      }
      winnersMap[email].winningNumbers.push(ticket.numberString);
    });
    
    // Convertir a array
    const winners = Object.values(winnersMap);
    
    res.json(winners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

