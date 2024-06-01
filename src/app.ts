import cors from 'cors';
import express from 'express';

import { errorHandler } from './api';
import campaignRoutes from './api/campaigns/campaigns.api';

const app = express();

app.use(cors());
app.use('/campaigns', campaignRoutes);
app.use(errorHandler);

export default app;
