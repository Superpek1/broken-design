import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { uploadRouter } from './modules/upload/upload.routes';
import { cdnRouter } from './modules/cdn/cdn.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ service: 'broken-design-cdn-service', status: 'ok' });
});

app.use('/api', uploadRouter);
app.use('/cdn', cdnRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`[Broken Design CDN-Service] running on http://localhost:${env.port}`);
});
