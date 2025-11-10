import Order from '../models/Order.js';
import TicketService from './TicketService.js';
import EmailService from './EmailService.js';
import Ticket from '../models/Ticket.js';

class OrderService {
  async approveOrder(orderId) {
    const order = await Order.findById(orderId).populate('raffle');

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    if (order.status !== 'pending_approval') {
      throw new Error(`El pedido no está en estado pending_approval. Estado actual: ${order.status}`);
    }

    // Validar tiempo: 30 minutos antes de vencer la rifa
    if (order.raffle.drawDate) {
      const drawDate = new Date(order.raffle.drawDate);
      const now = new Date();
      const timeUntilDraw = drawDate - now;
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutos en milisegundos
      
      if (timeUntilDraw < thirtyMinutes) {
        throw new Error('La rifa vence en menos de 30 minutos. Ya no se pueden aprobar pagos.');
      }
    }

    // Obtener tickets temporales existentes
    const tempTickets = await Ticket.find({ 
      order: orderId, 
      isTemporary: true 
    });

    let tickets;
    
    if (tempTickets.length > 0) {
      // Confirmar tickets temporales existentes
      await TicketService.confirmTemporaryTickets(orderId);
      tickets = await Ticket.find({ order: orderId });
    } else {
      // Si no hay tickets temporales, generar nuevos (caso legacy)
      tickets = await TicketService.generateAndSaveTickets(
        order.raffle,
        order,
        order.quantity,
        false // isTemporary = false
      );
    }

    // Actualizar estado del pedido
    order.status = 'completed';
    order.paymentApprovalDate = new Date();
    await order.save();

    // Enviar email de confirmación con los números
    try {
      await EmailService.sendOrderApprovedEmail(order, tickets);
    } catch (emailError) {
      console.error('Error enviando email de pedido aprobado:', emailError);
      // No fallar el proceso si el email falla
    }

    return order;
  }
}

export default new OrderService();

