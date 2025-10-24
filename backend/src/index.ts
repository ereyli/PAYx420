import express from 'express';
import cors from 'cors';
import { config } from './config';
import mintRoutes from './routes/mint';
import statsRoutes from './routes/stats';

const app = express();

// Middleware
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0',
  });
});

// Routes
app.use('/api', mintRoutes);
app.use('/api', statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server
app.listen(config.port, () => {
  console.log('🚀 PUMP402 Backend Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server running on port ${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Base RPC: ${config.baseRpcUrl}`);
  console.log(`💰 PAY402 Token: ${config.pay402TokenAddress || 'NOT SET'}`);
  console.log(`🏦 Facilitator: ${config.facilitatorAddress || 'NOT SET'}`);
  console.log(`💵 USDC Token: ${config.usdcAddress}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📖 API Endpoints:');
  console.log(`   GET  /api/mint?amount=10000     - Get payment request`);
  console.log(`   POST /api/mint                  - Process payment & mint`);
  console.log(`   GET  /api/stats                 - Get global stats`);
  console.log(`   GET  /api/stats/:address        - Get user stats`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});

