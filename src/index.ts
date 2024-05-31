import cors from 'cors';
import express from 'express';
import 'dotenv/config';

import { errorHandler } from './api';
import campaignRoutes from './api/campaigns/campaigns.api';

process.on('uncaughtException', error => {
  console.error('Uncaught Exception', error);
  process.exit(1);
});

const app = express();

app.use(cors());

app.use('/campaigns', campaignRoutes);

app.use(errorHandler);

const port = parseInt(process.env['PORT'] ?? '5123');
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

export default app;
