import mongoose from 'mongoose';

const RaffleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imageUrls: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'drawing_pending', 'finished'],
    default: 'draft',
    index: true
  },
  maxNumbers: {
    type: Number,
    required: true,
    min: 1
  },
  pricePerNumber: {
    type: Number,
    required: true,
    min: 0
  },
  drawDate: {
    type: Date
  },
  drawType: {
    type: String,
    enum: ['manual', 'external_api'],
    default: 'manual'
  },
  winningTickets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket'
  }]
}, {
  timestamps: true
});

export default mongoose.model('Raffle', RaffleSchema);

