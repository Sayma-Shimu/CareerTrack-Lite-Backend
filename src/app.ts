import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import applicationRoutes from './routes/application';
import dashboardRoutes from './routes/dashboard';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
    const isVercel = /\.vercel\.app$/.test(origin);
    const isAllowedOrigin = origin === CLIENT_URL;
    if (isLocalhost || isVercel || isAllowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'CareerTrack Lite API is running',
    timestamp: new Date().toISOString()
  });
});

export default app;
