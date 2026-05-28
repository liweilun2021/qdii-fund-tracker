import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import fundRoutes from './routes/fundRoutes';
import { refreshFunds } from './services/crawlerService';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', fundRoutes);

// Production: serve static frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
}

app.listen(config.port, () => {
  console.log(`[server] Running on http://localhost:${config.port}`);
  // Initial data fetch on startup
  refreshFunds().catch((err) => console.error('[server] Initial crawl failed:', err.message));
});
