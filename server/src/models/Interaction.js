import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  eventType: { type: String, enum: ['view', 'click', 'cart', 'purchase', 'wishlist'], required: true },
  source: { type: String, default: 'web' },
  occurredAt: { type: Date, default: Date.now, index: true },
  eventId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

interactionSchema.index({ userId: 1, occurredAt: -1 });
export default mongoose.model('Interaction', interactionSchema);
