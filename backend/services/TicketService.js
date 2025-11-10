import Ticket from '../models/Ticket.js';

class TicketService {
  async generateAndSaveTickets(raffle, order, quantity, isTemporary = false) {
    const maxNumbers = raffle.maxNumbers;
    
    // Obtener todos los números ya vendidos o reservados temporalmente para esta rifa
    const soldTickets = await Ticket.find({ 
      raffle: raffle._id,
      isTemporary: false // Solo considerar tickets confirmados como vendidos
    }).select('numberString');
    
    // También considerar tickets temporales para evitar duplicados
    const tempTickets = await Ticket.find({ 
      raffle: raffle._id,
      isTemporary: true
    }).select('numberString');
    
    // Crear Set para búsquedas O(1)
    const soldSet = new Set([
      ...soldTickets.map(t => t.numberString),
      ...tempTickets.map(t => t.numberString)
    ]);
    
    const ticketsToSave = [];
    let attempts = 0;
    const maxAttempts = maxNumbers * 10; // Límite de seguridad
    
    // Generar números únicos
    while (ticketsToSave.length < quantity) {
      attempts++;
      
      if (attempts > maxAttempts) {
        throw new Error('No se pudieron generar números únicos. La rifa puede estar casi llena.');
      }
      
      // Generar número aleatorio entre 1 y maxNumbers
      const num = Math.floor(Math.random() * maxNumbers) + 1;
      
      // Formatear con padding (ej. 00001, 09876)
      const numString = String(num).padStart(5, '0');
      
      // Verificar si no está vendido
      if (!soldSet.has(numString)) {
        ticketsToSave.push({
          raffle: raffle._id,
          order: order._id,
          numberString: numString,
          ownerEmail: order.buyerInfo.email,
          isTemporary: isTemporary
        });
        
        // Añadir al Set para evitar duplicados en la misma tanda
        soldSet.add(numString);
      }
    }
    
    // Guardar todos los tickets en una sola operación
    let savedTickets = [];
    if (ticketsToSave.length > 0) {
      savedTickets = await Ticket.insertMany(ticketsToSave);
    }
    
    return savedTickets;
  }

  async confirmTemporaryTickets(orderId) {
    // Confirmar todos los tickets temporales de un pedido
    const result = await Ticket.updateMany(
      { order: orderId, isTemporary: true },
      { $set: { isTemporary: false } }
    );
    return result;
  }
}

export default new TicketService();

