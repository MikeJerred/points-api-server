import { createKysely } from '@vercel/postgres-kysely';
import { FileMigrationProvider, Kysely, Migrator } from 'kysely';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

import type { Database } from '.';

export const db = createKysely<Database>();

migrateToLatest(db);

async function migrateToLatest(database: Kysely<Database>) {
  const migrator = new Migrator({
    db: database,
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
