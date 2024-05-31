import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';

import { CampaignNotFoundError, InvalidApiKeyError, db } from '.';

export async function createCampaign() {
  const apiKey = randomUUID();
  const hash = createHash('sha256').update(apiKey).digest('hex');

  const results = await db.insertInto('campaign')
    .values({ api_key_hash: hash })
    .returning(['id'])
    .execute();

  return {
    apiKey: apiKey,
    campaignId: results[0].id,
  };
}

export async function distributePoints(
  apiKey: string,
  campaignId: number,
  address: `0x${string}`,
  eventName: string,
  points: number,
) {
  await validateApiKey(apiKey, campaignId);

  await db.insertInto('point')
    .values({ campaign_id: campaignId, address: address, event_name: eventName, points: points })
    .execute();
}

export async function getPoints(apiKey: string, campaignId: number, address: `0x${string}`, eventName?: string) {
  await validateApiKey(apiKey, campaignId);

  const result = await db.selectFrom('campaign')
    .where('campaign.id', '=', campaignId)
    .innerJoin('point', 'point.campaign_id', 'campaign.id')
    .where('point.address', '=', address)
    .$if(!!eventName, qb => qb.where('point.event_name', '=', eventName ?? ''))
    .select(eb => eb.fn.sum<number | null>('point.points').as('points'))
    .executeTakeFirst();

  return result?.points ?? 0;
}

async function validateApiKey(apiKey: string, campaignId: number) {
  const hash = createHash('sha256').update(apiKey).digest();

  const campaign = await db.selectFrom('campaign')
    .where('id', '=', campaignId)
    .select(['api_key_hash'])
    .executeTakeFirst();

  if (!campaign) {
    throw new CampaignNotFoundError(campaignId);
  }

  if (!timingSafeEqual(Buffer.from(campaign.api_key_hash, 'hex'), hash)) {
    throw new InvalidApiKeyError();
  }
}
