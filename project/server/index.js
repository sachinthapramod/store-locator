import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { PORT, MONGODB_URI } from './config.js';
import storeRoutes from './routes/stores.js';
import authRoutes from './routes/auth.js';
import { seedDatabase } from './seed.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stores', storeRoutes);
app.use('/api/auth', authRoutes);

// API root
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Store Locator API' });
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('MongoDB connection error:', error.message);
  });

// Seed the database if needed
// seedDatabase(); 