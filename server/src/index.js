import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'node:http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import productsRouter from './routes/products.js';
import usersRouter from './routes/users.js';
import interactionsRouter from './routes/interactions.js';
import recommendationsRouter from './routes/recommendations.js';
import { startMqttConsumer } from './services/mqtt.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' } });
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'recommendation-api', timestamp: new Date().toISOString() }));
app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);
app.use('/api/interactions', interactionsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.name === 'ValidationError' ? 400 : err.code === 11000 ? 409 : 500;
  res.status(status).json({ message: status === 500 ? 'Internal server error' : err.message });
});

const port = Number(process.env.PORT || 5000);
try {
  await connectDB();
  startMqttConsumer(io);
  server.listen(port, () => console.log(`API listening on http://localhost:${port}`));
} catch (err) {
  console.error('Startup failed:', err.message);
  process.exit(1);
}
