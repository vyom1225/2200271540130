import express from 'express';
import mongoose from 'mongoose';
import routes from './routes/routes';

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const MONGO_URI = process.env.MONGO_URI as string;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`URL Shortener backend running on port ${PORT}`);
});
