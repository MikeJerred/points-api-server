import { createKysely } from '@vercel/postgres-kysely';
import { FileMigrationProvider, Generated, Migrator } from 'kysely';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

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

migrateToLatest();

async function migrateToLatest() {
  const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
      fs,
      path,
      migrationFolder: path.join(__dirname, 'migrations'),
    }),
  });

  const { error, results } = await migrator.migrateToLatest();

  results?.forEach(result => {
    if (result.status === 'Success') {
      console.log(`db migration "${result.migrationName}" was executed successfully`);
    } else if (result.status === 'Error') {
      console.error(`failed to execute db migration "${result.migrationName}"`);
    }
  })

  if (error) {
    console.error('failed to migrate', error);
    process.exit(1);
  }
}
