import Raffle from '../models/Raffle.js';
import Ticket from '../models/Ticket.js';
import Order from '../models/Order.js';
import EmailService from './EmailService.js';

class RaffleService {
  async drawWinner(raffleId, winningTicketNumbers = null) {
    const raffle = await Raffle.findById(raffleId);
    
    if (!raffle) {
      throw new Error('Rifa no encontrada');
    }
    
    if (!['active', 'drawing_pending'].includes(raffle.status)) {
      throw new Error(`La rifa no está en estado válido para sorteo. Estado actual: ${raffle.status}`);
    }
    
    // Buscar todos los tickets vendidos (asociados a pedidos completed)
    const completedOrders = await Order.find({ 
      raffle: raffleId, 
      status: 'completed' 
    }).select('_id');
    
    const orderIds = completedOrders.map(o => o._id);
    
    const tickets = await Ticket.find({ 
      raffle: raffleId,
      order: { $in: orderIds }
    }).populate('order');
    
    if (tickets.length === 0) {
      throw new Error('No hay tickets vendidos para esta rifa');
    }
    
    let winningTickets = [];
    
    if (winningTicketNumbers && winningTicketNumbers.length > 0) {
      // Sorteo manual: usar los números especificados
      for (const ticketNumber of winningTicketNumbers) {
        const ticket = tickets.find(t => t.numberString === ticketNumber);
        if (!ticket) {
          throw new Error(`El número ${ticketNumber} no existe o no está vendido`);
        }
        if (ticket.isWinner) {
          throw new Error(`El número ${ticketNumber} ya es ganador`);
        }
        ticket.isWinner = true;
        await ticket.save();
        winningTickets.push(ticket);
      }
    } else {
      // Sorteo aleatorio: seleccionar un ticket al azar
      const randomIndex = Math.floor(Math.random() * tickets.length);
      const winningTicket = tickets[randomIndex];
      winningTicket.isWinner = true;
      await winningTicket.save();
      winningTickets.push(winningTicket);
    }
    
    // Actualizar rifa
    winningTickets.forEach(ticket => {
      raffle.winningTickets.push(ticket._id);
    });
    raffle.status = 'finished';
    await raffle.save();
    
    // Enviar emails a los ganadores
    try {
      await EmailService.sendWinnerNotificationEmail(raffle, winningTickets);
    } catch (emailError) {
      console.error('Error enviando emails de ganadores:', emailError);
      // No fallar el proceso si el email falla
    }
    
    return {
      raffle,
      winningTickets
    };
  }
}

export default new RaffleService();

