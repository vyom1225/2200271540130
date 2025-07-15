import mongoose from 'mongoose';
import { interactionSchema } from './interaction';

const urlSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  originalUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  clicks: { type: Number, default: 0 },
  interactions: [interactionSchema]
});

const Url = mongoose.model('Url', urlSchema);
export { urlSchema, Url }; 