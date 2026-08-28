import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import passwordRoutes from './routes/passwords.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from backend directory or root
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config(); // fallback to root .env if present

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/passop';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/passwords', passwordRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'PassSaver Backend API is running smoothly.',
    dbState: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected'
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[DATABASE] Successfully connected to MongoDB at ${MONGO_URI.includes('@') ? 'MongoDB Atlas Cluster' : MONGO_URI}`);
  } catch (error) {
    console.error(`[DATABASE ERROR] Failed to connect to MongoDB: ${error.message}`);
    console.log(`[DATABASE NOTE] Ensure MongoDB is running locally or specify a valid MONGO_URI in backend/.env`);
  }
};

connectDB();

app.listen(PORT, () => {
  console.log(`[SERVER] PassSaver Backend running on http://localhost:${PORT}`);
});
