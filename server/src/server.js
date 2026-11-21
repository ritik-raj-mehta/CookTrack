import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import kitchenRoutes from './routes/kitchen.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (needed for accurate IP rate limiting behind proxies/load balancers)
app.set('trust proxy', 1);

// Connect to MongoDB
connectDB(process.env.MONGO_URI);

// ---- SECURITY & OPTIMIZATION MIDDLEWARES ----

// 1. HTTP Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false
  })
);

// 2. HTTP Gzip/Brotli Compression
app.use(compression());

// 3. Payload size limiting to avoid memory exhaustion attacks
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// 4. Rate Limiting

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    isSuccess: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }
});
app.use('/api', apiLimiter);

// Strict rate limiter for Authentication & OTP routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 35, // Limit each IP to 35 auth attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    isSuccess: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});
app.use('/api/auth', authLimiter);

// ---- CORS SETUP ----

// Default allowed origins (local dev)
const DEFAULT_ALLOWED = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

// Extra origins from env (comma-separated)
const envClient = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((s) => s.trim())
  : [];

const allowedOrigins = Array.from(new Set([...DEFAULT_ALLOWED, ...envClient]));

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser tools (like Postman or server-to-server) with no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      callback(null, false);
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

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    isSuccess: false,
    message: err.message || 'Internal Server Error'
  });
});

// ---- START SERVER ----
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Allowed CORS origins:', allowedOrigins.join(', '));
});
