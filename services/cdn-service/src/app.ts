import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { uploadRouter } from './modules/upload/upload.routes';
import { cdnRouter } from './modules/cdn/cdn.routes';
import { errorHandler } from './middlewares/error.middleware';
import { testDbConnection } from './config/db';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', async (_req, res) => {
  const dbStatus = await testDbConnection();
  res.json({
    service: 'broken-design-cdn-service',
    status: 'ok',
    database: dbStatus,
  });
});

app.use('/api', uploadRouter);
app.use('/cdn', cdnRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`[Broken Design CDN-Service] running on http://localhost:${env.port}`);
});
