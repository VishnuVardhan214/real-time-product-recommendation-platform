import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: 'https://placehold.co/600x400?text=Product' },
  tags: [{ type: String, lowercase: true, trim: true }],
  inventory: { type: Number, default: 50, min: 0 }
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
