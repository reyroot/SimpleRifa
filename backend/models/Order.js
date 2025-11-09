import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  raffle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Raffle',
    required: true
  },
  buyerInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending_payment', 'pending_approval', 'completed', 'cancelled'],
    default: 'pending_payment',
    index: true
  },
  paymentMethod: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMethod'
  },
  paymentProofUrl: {
    type: String,
    trim: true
  },
  paymentApprovalDate: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', OrderSchema);

