import { createKysely } from '@vercel/postgres-kysely';
import { Generated } from 'kysely';

export * from './errors';

interface CampaignTable {
  id: Generated<number>;
  api_key_hash: string;
}

interface PointTable {
  id: Generated<number>;
  campaign_id: number;
  address: `0x${string}`;
  event_name: string;
  points: number;
}

interface Database {
  campaign: CampaignTable;
  point: PointTable;
}

export const db = createKysely<Database>();
