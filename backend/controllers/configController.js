import { validationResult } from 'express-validator';
import Config from '../models/Config.js';

export const getConfig = async (req, res) => {
  try {
    const config = await Config.getConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    let config = await Config.findOne();
    if (!config) {
      config = new Config({ logoFile: req.file.filename });
      await config.save();
    } else {
      config.logoFile = req.file.filename;
      await config.save();
    }

    res.json({ logoFile: req.file.filename, logoUrl: fileUrl });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Error de validación',
        errors: errors.array() 
      });
    }

    // Limpiar campos vacíos (strings vacíos se convierten a undefined para usar defaults)
    const cleanedData = {};
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== '' && req.body[key] !== null && req.body[key] !== undefined) {
        cleanedData[key] = req.body[key];
      }
    });

    let config = await Config.findOne();
    if (!config) {
      config = new Config(cleanedData);
      await config.save();
    } else {
      Object.assign(config, cleanedData);
      await config.save();
    }

    res.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: error.message });
  }
};

