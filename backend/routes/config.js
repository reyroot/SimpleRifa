import express from 'express';
import { body } from 'express-validator';
import { getConfig, updateConfig, uploadLogo } from '../controllers/configController.js';
import { uploadLogo as uploadLogoMiddleware } from '../middleware/uploadLogo.js';

const router = express.Router();

// Helper para validar colores solo si no están vacíos
const validateColorIfPresent = (fieldName) => {
  return body(fieldName)
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value || value === '') return true;
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
    })
    .withMessage(`${fieldName} debe ser un código hexadecimal válido`);
};

// Helper para validar URLs solo si no están vacías
const validateUrlIfPresent = (fieldName) => {
  return body(fieldName)
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value || value === '') return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .withMessage(`${fieldName} debe ser una URL válida`);
};

// Ruta pública para obtener configuración
router.get('/', getConfig);

// Ruta admin para subir logo
router.post('/upload-logo', uploadLogoMiddleware, uploadLogo);

// Ruta admin para actualizar configuración
router.put(
  '/',
  [
    body('platformName').trim().notEmpty().withMessage('El nombre de la plataforma no puede estar vacío'),
    validateColorIfPresent('primaryColor'),
    validateColorIfPresent('secondaryColor'),
    validateColorIfPresent('accentColor'),
    validateColorIfPresent('backgroundColor'),
    validateColorIfPresent('textColor'),
    body('contactEmail').optional({ checkFalsy: true }).isEmail().withMessage('El email de contacto debe ser válido'),
    validateUrlIfPresent('logoUrl'),
    validateUrlIfPresent('faviconUrl'),
    body('contactPhone').optional(),
    body('footerText').optional(),
    body('currency').optional().isIn(['USD', 'VES']).withMessage('La moneda debe ser USD o VES')
  ],
  updateConfig
);

export default router;

