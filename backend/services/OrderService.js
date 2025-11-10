import Order from '../models/Order.js';
import TicketService from './TicketService.js';
import EmailService from './EmailService.js';

class OrderService {
  async approveOrder(orderId) {
    const order = await Order.findById(orderId).populate('raffle');

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    if (order.status !== 'pending_approval') {
      throw new Error(`El pedido no está en estado pending_approval. Estado actual: ${order.status}`);
    }

    // Actualizar estado del pedido
    order.status = 'completed';
    order.paymentApprovalDate = new Date();
    await order.save();

    // Generar y guardar tickets
    const tickets = await TicketService.generateAndSaveTickets(
      order.raffle,
      order,
      order.quantity
    );

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

