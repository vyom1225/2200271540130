import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  source: String,
  ip: String,
  geo: String
}, { _id: false });

const Interaction = mongoose.model('Interaction', interactionSchema);
export { interactionSchema, Interaction }; 