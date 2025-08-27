import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import balanceRoutes from './routes/balanceRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import receiptRoutes from './routes/receiptRoutes.js'; // <-- Add this line
import { startSubscriptionProcessor } from './services/cronJobs.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/balances', balanceRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/receipts', receiptRoutes); // <-- Add this line


// --- Database Connection ---
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
      startSubscriptionProcessor();
    });
  })
  .catch((error) => {
    console.error('Connection error', error.message);
  });
