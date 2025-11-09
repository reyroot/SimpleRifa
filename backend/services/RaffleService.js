import Raffle from '../models/Raffle.js';
import Ticket from '../models/Ticket.js';
import Order from '../models/Order.js';

class RaffleService {
  async drawWinner(raffleId) {
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
    });
    
    if (tickets.length === 0) {
      throw new Error('No hay tickets vendidos para esta rifa');
    }
    
    // Seleccionar ticket(s) ganador(es) al azar
    const randomIndex = Math.floor(Math.random() * tickets.length);
    const winningTicket = tickets[randomIndex];
    
    // Marcar ticket como ganador
    winningTicket.isWinner = true;
    await winningTicket.save();
    
    // Actualizar rifa
    raffle.winningTickets.push(winningTicket._id);
    raffle.status = 'finished';
    await raffle.save();
    
    return {
      raffle,
      winningTicket
    };
  }
}

export default new RaffleService();

