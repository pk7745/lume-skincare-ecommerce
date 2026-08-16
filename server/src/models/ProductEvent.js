import mongoose from 'mongoose';

const productEventSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    eventType: {
      type: String,
      enum: ['view', 'cart_add', 'wishlist_add', 'purchase'],
      required: true,
    },
    quantity: { type: Number, default: 1, min: 1 },
    sessionId: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

productEventSchema.index({ product: 1, eventType: 1, timestamp: -1 });
productEventSchema.index({ eventType: 1, timestamp: -1 });
productEventSchema.index({ product: 1, sessionId: 1, eventType: 1, timestamp: -1 });

export const ProductEvent = mongoose.model('ProductEvent', productEventSchema);
