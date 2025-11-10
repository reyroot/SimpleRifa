import { validationResult } from 'express-validator';
import Order from '../models/Order.js';
import Raffle from '../models/Raffle.js';
import Ticket from '../models/Ticket.js';
import OrderService from '../services/OrderService.js';

export const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { raffleId, quantity, buyerInfo } = req.body;
    
    // Verificar que la rifa existe y está activa
    const raffle = await Raffle.findById(raffleId);
    if (!raffle) {
      return res.status(404).json({ error: 'Rifa no encontrada' });
    }
    
    if (raffle.status !== 'active') {
      return res.status(400).json({ error: 'La rifa no está activa' });
    }
    
    // Calcular total
    const totalAmount = quantity * raffle.pricePerNumber;
    
    // Crear pedido
    const order = new Order({
      raffle: raffleId,
      quantity,
      buyerInfo,
      totalAmount,
      status: 'pending_payment'
    });
    
    await order.save();
    await order.populate('raffle');
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadProof = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('raffle');
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }
    
    // Validar que la rifa esté activa
    if (order.raffle && order.raffle.status !== 'active') {
      // Si la rifa no está activa, cancelar el pedido automáticamente
      // Eliminar tickets temporales si existen (aunque no deberían existir en este punto)
      await Ticket.deleteMany({ 
        order: order._id, 
        isTemporary: true 
      });
      order.status = 'cancelled';
      await order.save();
      return res.status(400).json({ 
        error: `La rifa "${order.raffle.title}" ya no está activa. Tu pedido ha sido cancelado automáticamente.` 
      });
    }
    
    // Validar tiempo: 30 minutos antes de vencer la rifa
    if (order.raffle.drawDate) {
      const drawDate = new Date(order.raffle.drawDate);
      const now = new Date();
      const timeUntilDraw = drawDate - now;
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutos en milisegundos
      
      if (timeUntilDraw < thirtyMinutes) {
        // Eliminar tickets temporales si existen
        await Ticket.deleteMany({ 
          order: order._id, 
          isTemporary: true 
        });
        order.status = 'cancelled';
        await order.save();
        return res.status(400).json({ 
          error: `La rifa vence en menos de 30 minutos. Ya no se pueden procesar nuevos pagos.` 
        });
      }
    }
    
    // En producción, aquí deberías subir el archivo a un bucket (S3, Cloudinary, etc.)
    // Por ahora, guardamos la URL/path del archivo
    const fileUrl = `/uploads/${req.file.filename}`;
    
    order.paymentProofUrl = fileUrl;
    order.status = 'pending_approval';
    await order.save();
    
    // Crear tickets temporales cuando se sube el comprobante
    const TicketService = (await import('../services/TicketService.js')).default;
    const tickets = await TicketService.generateAndSaveTickets(
      order.raffle,
      order,
      order.quantity,
      true // isTemporary = true
    );
    
    res.json({ order, tickets });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    
    const orders = await Order.find(filter)
      .populate('raffle')
      .populate('paymentMethod')
      .sort({ createdAt: -1 });
    
    // Para cada pedido completado, obtener sus tickets
    const ordersWithTickets = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject();
        if (order.status === 'completed') {
          const tickets = await Ticket.find({ order: order._id })
            .select('numberString isWinner')
            .sort({ numberString: 1 });
          orderObj.tickets = tickets;
        }
        return orderObj;
      })
    );
    
    res.json(ordersWithTickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const approveOrder = async (req, res) => {
  try {
    const order = await OrderService.approveOrder(req.params.id);
    await order.populate('raffle');
    await order.populate('paymentMethod');
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    // Solo permitir cancelar pedidos que no estén completados
    if (order.status === 'completed') {
      return res.status(400).json({ error: 'No se puede cancelar un pedido completado' });
    }
    
    // Eliminar tickets temporales asociados a este pedido para liberar los números
    await Ticket.deleteMany({ 
      order: order._id, 
      isTemporary: true 
    });
    
    order.status = 'cancelled';
    await order.save();
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    // Solo permitir eliminar pedidos pendientes (pending_payment o pending_approval)
    if (!['pending_payment', 'pending_approval'].includes(order.status)) {
      return res.status(400).json({ error: 'Solo se pueden eliminar pedidos pendientes de pago o aprobación' });
    }
    
    // Eliminar tickets temporales asociados a este pedido para liberar los números
    await Ticket.deleteMany({ 
      order: order._id, 
      isTemporary: true 
    });
    
    await Order.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Pedido eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

