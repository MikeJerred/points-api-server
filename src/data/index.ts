import { Generated } from 'kysely';

export { db } from './database';

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

export interface Database {
  campaigns: CampaignTable;
  points: PointTable;
}
