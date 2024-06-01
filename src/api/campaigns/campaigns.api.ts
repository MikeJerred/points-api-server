import express from 'express';
import Router from 'express-promise-router';
import { body, param, query } from 'express-validator';

import { logError, validate, withApiKey, withVersion } from '..';
import { CampaignNotFoundError, InvalidApiKeyError } from '../../data';
import { createCampaign, distributePoints, getPoints } from '../../data/campaigns';

const router = Router();
router.use(express.json());
export default router;

router.post(
  '/create',
  withVersion(),
  async (req, res) => {
    switch (res.locals.version) {
      case '1.0.0':
      default: {
        const { apiKey, campaignId } = await createCampaign();

        return res.status(200).json({
          apiKey,
          campaignId,
        });
      }
    }
  },
);

router.get(
  '/:campaignId/points',
  withVersion(),
  withApiKey(),
  validate([
    param('campaignId').isInt().withMessage('Campaign id must be an integer'),
    query('address').matches(/0x.*/).withMessage('Address must start with "0x"'),
    query('event').isString().optional(),
  ]),
  async (req, res) => {
    switch (res.locals.version) {
      case '1.0.0':
      default: {
        const campaignId = +req.params.campaignId;
        const apiKey = res.locals.apiKey as string;
        const address = req.query.address as `0x${string}`;
        const eventName = req.query.event as string | undefined;

        try {
          const points = await getPoints(apiKey, campaignId, address, eventName);
          return res.status(200).json(points);
        } catch (error: any) {
          if (error instanceof CampaignNotFoundError) {
            logError(404, req, error.message);
            return res.status(404).json({ reason: 'not-found', message: error.message });
          }

          if (error instanceof InvalidApiKeyError) {
            logError(403, req, error.message);
            return res.status(403).json({ reason: 'forbidden', message: error.message });
          }

          throw error;
        }
      }
    }
  },
);

router.post(
  '/:campaignId/points',
  withVersion(),
  withApiKey(),
  validate([
    param('campaignId').isInt().withMessage('Campaign id must be an integer'),
    body('address').matches(/0x.*/).withMessage('Address must start with "0x"'),
    body('event').isString(),
    body('points').isInt({ gt: 0 }).withMessage('Points must be a positive integer'),
  ]),
  async (req, res) => {
    switch (res.locals.version) {
      case '1.0.0':
      default: {
        const campaignId = +req.params.campaignId;
        const apiKey = res.locals.apiKey as string;
        const address = req.body.address as `0x${string}`;
        const eventName = req.body.event as string;
        const points = +req.body.points;

        try {
          await distributePoints(apiKey, campaignId, address, eventName, points);
          return res.sendStatus(204);
        } catch (error: any) {
          if (error instanceof CampaignNotFoundError) {
            logError(404, req, error.message);
            return res.status(404).json({ reason: 'not-found', message: error.message });
          }

          if (error instanceof InvalidApiKeyError) {
            logError(403, req, error.message);
            return res.status(403).json({ reason: 'forbidden', message: error.message });
          }

          throw error;
        }
      }
    }
  },
);
