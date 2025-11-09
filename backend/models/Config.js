import mongoose from 'mongoose';

const ConfigSchema = new mongoose.Schema({
  platformName: {
    type: String,
    default: 'Sistema de Rifas',
    trim: true
  },
  primaryColor: {
    type: String,
    default: '#007bff',
    trim: true
  },
  secondaryColor: {
    type: String,
    default: '#6c757d',
    trim: true
  },
  accentColor: {
    type: String,
    default: '#28a745',
    trim: true
  },
  backgroundColor: {
    type: String,
    default: '#f5f5f5',
    trim: true
  },
  textColor: {
    type: String,
    default: '#333333',
    trim: true
  },
  logoUrl: {
    type: String,
    trim: true
  },
  faviconUrl: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  footerText: {
    type: String,
    default: '© 2024 Sistema de Rifas. Todos los derechos reservados.',
    trim: true
  }
}, {
  timestamps: true
});

// Solo debe haber una configuración
ConfigSchema.statics.getConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = new this({});
    await config.save();
  }
  return config;
};

export default mongoose.model('Config', ConfigSchema);

