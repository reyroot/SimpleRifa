import Ticket from '../models/Ticket.js';
import Order from '../models/Order.js';

export const getMyTickets = async (req, res) => {
  try {
    const { email, otp } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Parámetro email requerido' });
    }
    
    // Si hay OTP, validarlo primero
    if (otp) {
      // Obtener OTP del store (en memoria o Redis en producción)
      const storedOTP = req.app.locals.otpStore?.[email.toLowerCase()];
      if (!storedOTP || storedOTP.code !== otp || storedOTP.expires < Date.now()) {
        return res.status(401).json({ error: 'OTP inválido o expirado' });
      }
      // OTP válido, eliminarlo
      delete req.app.locals.otpStore[email.toLowerCase()];
    }
    
    const tickets = await Ticket.find({ ownerEmail: email.toLowerCase() })
      .populate('raffle')
      .populate('order')
      .sort({ isTemporary: 1, createdAt: -1 }); // Tickets confirmados primero
    
    // Agrupar tickets por rifa
    const ticketsByRaffle = {};
    tickets.forEach(ticket => {
      const raffleId = ticket.raffle?._id?.toString() || 'unknown';
      if (!ticketsByRaffle[raffleId]) {
        ticketsByRaffle[raffleId] = {
          raffle: ticket.raffle,
          tickets: [],
          lastParticipationDate: ticket.createdAt
        };
      }
      ticketsByRaffle[raffleId].tickets.push(ticket);
      // Actualizar fecha de última participación si es más reciente
      if (new Date(ticket.createdAt) > new Date(ticketsByRaffle[raffleId].lastParticipationDate)) {
        ticketsByRaffle[raffleId].lastParticipationDate = ticket.createdAt;
      }
    });
    
    // Convertir a array y ordenar por fecha de última participación (más reciente primero)
    const rafflesList = Object.values(ticketsByRaffle).sort((a, b) => {
      return new Date(b.lastParticipationDate) - new Date(a.lastParticipationDate);
    });
    
    // También obtener pedidos pendientes de aprobación para este email
    const pendingOrders = await Order.find({
      'buyerInfo.email': email.toLowerCase(),
      status: 'pending_approval'
    })
      .populate('raffle', 'title')
      .populate('paymentMethod')
      .sort({ createdAt: -1 });
    
    res.json({
      raffles: rafflesList,
      pendingOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRaffleTickets = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener todos los pedidos completados de esta rifa
    const completedOrders = await Order.find({ 
      raffle: id, 
      status: 'completed' 
    }).select('_id');
    
    const orderIds = completedOrders.map(o => o._id);
    
    // Obtener todos los tickets vendidos
    const tickets = await Ticket.find({ 
      raffle: id,
      order: { $in: orderIds }
    })
      .select('numberString isWinner ownerEmail')
      .populate('order', 'buyerInfo')
      .sort({ numberString: 1 });
    
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email requerido' });
    }
    
    // Generar OTP de 6 dígitos
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutos
    
    // Guardar OTP en memoria (en producción usar Redis)
    if (!req.app.locals.otpStore) {
      req.app.locals.otpStore = {};
    }
    req.app.locals.otpStore[email.toLowerCase()] = { code: otp, expires };
    
    // Enviar email con OTP
    const EmailService = (await import('../services/EmailService.js')).default;
    try {
      await EmailService.sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Error enviando OTP:', emailError);
      return res.status(500).json({ error: 'Error al enviar el código de verificación' });
    }
    
    res.json({ message: 'Código de verificación enviado a tu email' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

