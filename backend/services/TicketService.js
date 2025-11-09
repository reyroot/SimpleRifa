import Ticket from '../models/Ticket.js';

class TicketService {
  async generateAndSaveTickets(raffle, order, quantity) {
    const maxNumbers = raffle.maxNumbers;
    
    // Obtener todos los números ya vendidos para esta rifa
    const soldTickets = await Ticket.find({ raffle: raffle._id })
      .select('numberString');
    
    // Crear Set para búsquedas O(1)
    const soldSet = new Set(soldTickets.map(t => t.numberString));
    
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
          ownerEmail: order.buyerInfo.email
        });
        
        // Añadir al Set para evitar duplicados en la misma tanda
        soldSet.add(numString);
      }
    }
    
    // Guardar todos los tickets en una sola operación
    if (ticketsToSave.length > 0) {
      await Ticket.insertMany(ticketsToSave);
    }
    
    return ticketsToSave;
  }
}

export default new TicketService();

