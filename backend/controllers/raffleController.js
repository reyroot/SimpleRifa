import { validationResult } from 'express-validator';
import Raffle from '../models/Raffle.js';
import Ticket from '../models/Ticket.js';

export const getRaffles = async (req, res) => {
  try {
    const { status } = req.query;
    // Detectar si es ruta admin verificando la URL original o el path
    const isAdminRoute = req.originalUrl.includes('/admin/raffles') || req.path.includes('/admin');
    const filter = status ? { status } : (isAdminRoute ? {} : { status: 'active' });
    
    const raffles = await Raffle.find(filter).sort({ createdAt: -1 });
    
    // Si es ruta admin, agregar estadísticas de tickets vendidos
    if (isAdminRoute) {
      const rafflesWithStats = await Promise.all(
        raffles.map(async (raffle) => {
          // Solo contar tickets confirmados (no temporales)
          const soldTicketsCount = await Ticket.countDocuments({ 
            raffle: raffle._id,
            isTemporary: false
          });
          // Contar también tickets temporales para porcentaje
          const tempTicketsCount = await Ticket.countDocuments({ 
            raffle: raffle._id,
            isTemporary: true
          });
          const totalTickets = soldTicketsCount + tempTicketsCount;
          const soldPercentage = raffle.maxNumbers > 0 
            ? Math.round((totalTickets / raffle.maxNumbers) * 100) 
            : 0;
          return {
            ...raffle.toObject(),
            soldTicketsCount,
            tempTicketsCount,
            totalTickets,
            soldPercentage
          };
        })
      );
      return res.json(rafflesWithStats);
    }
    
    // Para rutas públicas, también agregar porcentaje vendido
    const rafflesWithPercentage = await Promise.all(
      raffles.map(async (raffle) => {
        const soldTicketsCount = await Ticket.countDocuments({ 
          raffle: raffle._id,
          isTemporary: false
        });
        const tempTicketsCount = await Ticket.countDocuments({ 
          raffle: raffle._id,
          isTemporary: true
        });
        const totalTickets = soldTicketsCount + tempTicketsCount;
        const soldPercentage = raffle.maxNumbers > 0 
          ? Math.round((totalTickets / raffle.maxNumbers) * 100) 
          : 0;
        return {
          ...raffle.toObject(),
          soldPercentage
        };
      })
    );
    
    res.json(rafflesWithPercentage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRaffleById = async (req, res) => {
  try {
    const raffle = await Raffle.findById(req.params.id)
      .populate('winningTickets');
    
    if (!raffle) {
      return res.status(404).json({ error: 'Rifa no encontrada' });
    }
    
    res.json(raffle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createRaffle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const raffle = new Raffle(req.body);
    await raffle.save();
    res.status(201).json(raffle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRaffle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const raffle = await Raffle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!raffle) {
      return res.status(404).json({ error: 'Rifa no encontrada' });
    }
    
    res.json(raffle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRaffle = async (req, res) => {
  try {
    const raffle = await Raffle.findByIdAndDelete(req.params.id);
    
    if (!raffle) {
      return res.status(404).json({ error: 'Rifa no encontrada' });
    }
    
    res.json({ message: 'Rifa eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadRaffleImages = async (req, res) => {
  try {
    console.log('Upload request received:', {
      params: req.params,
      files: req.files ? req.files.length : 0,
      body: req.body
    });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se subieron archivos' });
    }

    const raffle = await Raffle.findById(req.params.id);
    
    if (!raffle) {
      return res.status(404).json({ error: 'Rifa no encontrada' });
    }

    // Generar URLs de las imágenes subidas
    const imageUrls = req.files.map(file => {
      // Construir la URL completa
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      // Asegurar que la URL no tenga doble barra
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      return `${cleanBaseUrl}/uploads/${file.filename}`;
    });

    // Agregar las nuevas imágenes a las existentes
    raffle.imageUrls = [...(raffle.imageUrls || []), ...imageUrls];
    await raffle.save();

    res.json({ 
      message: 'Imágenes subidas correctamente',
      imageUrls: raffle.imageUrls 
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: error.message || 'Error al subir imágenes' });
  }
};

