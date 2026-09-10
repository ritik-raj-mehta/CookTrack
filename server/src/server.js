import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import kitchenRoutes from './routes/kitchen.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB(process.env.MONGO_URI);

// Middlewares
app.use(express.json());
app.use(cookieParser());

// ---- CORS SETUP ----

// Default allowed origins (local dev)
const DEFAULT_ALLOWED = [
  'http://localhost:3000',
  'http://localhost:5173'
];

// Extra origins from env (comma-separated)
const envClient = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
  : [];

const allowedOrigins = Array.from(new Set([...DEFAULT_ALLOWED, ...envClient]));

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser tools (like Postman) with no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
};

app.use(cors(corsOptions));

// ---- ROUTES ----
app.use('/api/auth', authRoutes);
app.use('/api/kitchen', kitchenRoutes);

app.get('/', (req, res) => res.send('CookTrack MERN server is running'));

// ---- START SERVER ----
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed CORS origins:', allowedOrigins.join(', '));
});
