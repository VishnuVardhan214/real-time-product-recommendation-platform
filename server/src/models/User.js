import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  displayName: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  segment: { type: String, default: 'general' }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
