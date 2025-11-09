import Order from '../models/Order.js';
import TicketService from './TicketService.js';

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
    await TicketService.generateAndSaveTickets(
      order.raffle,
      order,
      order.quantity
    );

    // TODO: Disparar evento de email al buyerInfo.email con los números generados

    return order;
  }
}

export default new OrderService();

