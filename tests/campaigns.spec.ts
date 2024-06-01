import { afterEach, beforeAll, expect, jest, test } from '@jest/globals';
import type { Kysely } from 'kysely';
import { newDb } from 'pg-mem';
import request from 'supertest';

import type { Database } from '../src/data';
import { up } from '../src/data/migrations/20240531_init';

const mem = newDb();
const db = mem.adapters.createKysely() as Kysely<Database>;

jest.mock('../src/data/database', () => ({ db }));

import app from '../src/app';

beforeAll(async () => {
  await up(db);
});

afterEach(async () => {
  mem.public.none(`delete from points`);
  mem.public.none(`delete from campaigns`);
});

test('can create campaign', async () => {
  const response = await request(app)
    .post('/campaigns/create')
    .expect(200);

  expect(response.body).toHaveProperty('apiKey');
  expect(response.body).toHaveProperty('campaignId');
  expect(response.body.campaignId).toBe(1);

  const data = mem.public.many('select * from campaigns');
  expect(data.length).toBe(1);
  expect(data[0].id).toBe(1);
});

test('can get points', async () => {
  const agent = request.agent(app);

  const createCampaignResponse = await agent
    .post('/campaigns/create')
    .expect(200);

  const { apiKey, campaignId } = createCampaignResponse.body as { apiKey: string; campaignId: number; };

  const address = '0x24e5bec76fa3d750bfa97bdbf16b377f6b13af15';

  mem.public.none(`
    insert into points (campaign_id, address, event_name, points)
    values (${campaignId}, '${address}', 'test', 50)
  `);

  const getPointsResponse = await agent
    .get(`/campaigns/${campaignId}/points?address=${address}`)
    .set('X-API-KEY', apiKey)
    .expect(200);

  expect(getPointsResponse.body).toBe(50);
});

test('can distribute points', async () => {
  const agent = request.agent(app);

  const createCampaignResponse = await agent
    .post('/campaigns/create')
    .expect(200);

  const { apiKey, campaignId } = createCampaignResponse.body as { apiKey: string; campaignId: number; };


  await agent
    .post(`/campaigns/${campaignId}/points`)
    .set('X-API-KEY', apiKey)
    .set('Accept', 'application/json')
    .send({
      address: '0x24e5bec76fa3d750bfa97bdbf16b377f6b13af15',
      event: 'test',
      points: 1000,
    })
    .expect(204);

  const data = mem.public.many(`
    select sum(points) as total
    from points
    where address = '0x24e5bec76fa3d750bfa97bdbf16b377f6b13af15'
  `);
  expect(data.length).toBe(1);
  expect(data[0].total).toBe(1000);
});
