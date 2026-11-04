import express from 'express';
import helmet from 'helmet';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'expressjs' });
});
app.get('/api', (_req, res) => {
  res.json({ name: 'Pich Chamroeun Pharmacy API', version: '1.0.0' });
});
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.use((error, _req, res, _next) => {
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  if (status === 500) console.error(error);
  res.status(status).json({ error: status === 500 ? 'Internal server error' : 'Invalid request' });
});
