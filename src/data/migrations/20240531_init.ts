import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('campaign')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('api_key_hash', 'varchar(64)', col => col.notNull())
    .execute();

  await db.schema
    .createTable('point')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('campaign_id', 'integer', col => col.references('campaign.id').onDelete('cascade').notNull())
    .addColumn('address', 'varchar(42)', col => col.notNull())
    .addColumn('event_name', 'varchar', col => col.notNull())
    .addColumn('points', 'integer', col => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('point').execute();
  await db.schema.dropTable('campaign').execute();
}
