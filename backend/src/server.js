import 'dotenv/config';
import { app } from './app.js';

const port = Number(process.env.PORT || 4000);
const server = app.listen(port, process.env.HOST || '0.0.0.0', () => {
  console.log(`API listening on port ${port}`);
});
for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  });
}
