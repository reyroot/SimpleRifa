import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
  raffle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Raffle',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  numberString: {
    type: String,
    required: true,
    trim: true
  },
  ownerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true
  },
  isWinner: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índice compuesto para asegurar unicidad de número por rifa
TicketSchema.index({ raffle: 1, numberString: 1 }, { unique: true });

export default mongoose.model('Ticket', TicketSchema);

