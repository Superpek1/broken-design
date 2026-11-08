import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { authRouter } from './modules/auth/auth.routes';
import { modelsRouter } from './modules/models/models.routes';
import { paymentsRouter } from './modules/payments/payments.routes';
import { interactionsRouter } from './modules/interactions/interactions.routes';
import { db, testDbConnection } from './config/db';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());

app.get('/health', async (_req, res) => {
  const dbStatus = await testDbConnection();
  res.json({
    service: 'broken-design-core-api',
    status: 'ok',
    database: dbStatus,
  });
});

app.use('/api/auth', authRouter);
app.use('/api/models', modelsRouter);
app.use('/api', paymentsRouter);
app.use('/api', interactionsRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`[Broken Design Core-API] running on http://localhost:${env.port}`);
});
