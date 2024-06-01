import { Kysely } from 'kysely';

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('campaigns')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('api_key_hash', 'varchar(64)', col => col.notNull())
    .execute();

  await db.schema
    .createTable('points')
    .addColumn('id', 'serial', col => col.primaryKey())
    .addColumn('campaign_id', 'integer', col => col.references('campaigns.id').onDelete('cascade').notNull())
    .addColumn('address', 'varchar(42)', col => col.notNull())
    .addColumn('event_name', 'varchar', col => col.notNull())
    .addColumn('points', 'integer', col => col.notNull())
    .addForeignKeyConstraint('fk_campaign_id', ['campaign_id'], 'campaigns', ['id'])
    .execute();
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('points').ifExists().execute();
  await db.schema.dropTable('campaigns').ifExists().cascade().execute();
}
