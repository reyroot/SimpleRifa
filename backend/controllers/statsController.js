import Ticket from '../models/Ticket.js';
import Order from '../models/Order.js';

export const getTopBuyers = async (req, res) => {
  try {
    // Agrupar tickets por email y contar cantidad
    const topBuyers = await Ticket.aggregate([
      {
        $match: {
          isTemporary: false // Solo tickets confirmados
        }
      },
      {
        $group: {
          _id: '$ownerEmail',
          totalTickets: { $sum: 1 }
        }
      },
      {
        $sort: { totalTickets: -1 }
      },
      {
        $limit: 10 // Top 10 compradores
      },
      {
        $lookup: {
          from: 'orders',
          let: { buyerEmail: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$buyerInfo.email', '$$buyerEmail']
                },
                status: 'completed'
              }
            },
            {
              $limit: 1
            }
          ],
          as: 'orderInfo'
        }
      },
      {
        $project: {
          email: '$_id',
          totalTickets: 1,
          name: { $arrayElemAt: ['$orderInfo.buyerInfo.name', 0] }
        }
      }
    ]);

    // Ocultar parte del email con asteriscos
    const maskedBuyers = topBuyers.map(buyer => {
      const emailParts = buyer.email.split('@');
      const username = emailParts[0];
      const domain = emailParts[1];
      
      // Ocultar parte del username (ej: juan.perez -> j***.p***)
      const maskedUsername = username.length > 2
        ? username[0] + '*'.repeat(Math.min(username.length - 2, 3)) + username.slice(-1)
        : username[0] + '*';
      
      return {
        ...buyer,
        maskedEmail: `${maskedUsername}@${domain}`
      };
    });

    res.json(maskedBuyers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

