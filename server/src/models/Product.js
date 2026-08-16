import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  color: { type: String, default: '' },
  sku: { type: String, default: '' },
  price: { type: Number },
  stock: { type: Number, default: 0 },
});

const productSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    compare_at_price: { type: Number, default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    category_id: { type: String, default: null },
    images: [{ type: String }],
    sizes: [{ type: String }],
    variants: [variantSchema],
    skin_type: { type: String, default: 'all' },
    stock: { type: Number, required: true, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    review_count: { type: Number, default: 0, min: 0 },
    reviewCount: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    popularity: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        ret.category_id = ret.category ? ret.category.toString() : ret.category_id;
        ret.review_count = ret.reviewCount || ret.review_count || 0;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

productSchema.index({ category: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdAt: -1 });

export const Product = mongoose.model('Product', productSchema);
