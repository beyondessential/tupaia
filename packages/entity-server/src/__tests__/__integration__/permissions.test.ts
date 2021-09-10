/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TestableEntityServer, setupTestApp, tearDownTestApp } from '../testUtilities';
import { getEntitiesWithFields, sortedByCode } from './fixtures';

describe('permissions', () => {
  let app: TestableEntityServer;

  beforeAll(async () => {
    app = await setupTestApp();
    app.grantAccessToCountries(['JOHTO']);
  });

  afterAll(() => tearDownTestApp(app));

  describe('no access', () => {
    it('throws error if fetching project with no access to any of its countries', async () => {
      const { text } = await app.get('hierarchy/redblue/redblue', {
        query: { fields: 'code,name,type' },
      });

      const error = JSON.parse(text);

      expect(error).toEqual({
        error: 'No access to requested entities: redblue',
      });
    });

    it('throws error if fetching country with no access', async () => {
      const { text } = await app.get('hierarchy/redblue/KANTO', {
        query: { fields: 'code,name,type' },
      });

      const error = JSON.parse(text);

      expect(error).toEqual({
        error: 'No access to requested entities: KANTO',
      });
    });

    it('throws error if fetching city with no access to country', async () => {
      const { text } = await app.get('hierarchy/redblue/CELADON', {
        query: { fields: 'code,name,type' },
      });

      const error = JSON.parse(text);

      expect(error).toEqual({
        error: 'No access to requested entities: CELADON',
      });
    });
  });

  describe('filtering entities by access', () => {
    it('filters entities when requested for some with access', async () => {
      const { text } = await app.post('hierarchy/goldsilver', {
        query: { fields: 'code,name,type' },
        body: { entities: ['KANTO', 'VIRIDIAN', 'ECRUTEAK', 'SLOWPOKE_WELL'] },
      });

      const entities = JSON.parse(text);
      expect(entities).toBeArray();
      expect(sortedByCode(entities)).toEqual(
        sortedByCode(
          getEntitiesWithFields(['ECRUTEAK', 'SLOWPOKE_WELL'], ['code', 'name', 'type']),
        ),
      );
    });

    it('filters descendants when requested for some with access', async () => {
      const { text } = await app.post('hierarchy/goldsilver/descendants', {
        query: { fields: 'code,name,type' },
        body: { entities: ['LAVENDER', 'ECRUTEAK'] },
      });

      const entities = JSON.parse(text);
      expect(entities).toBeArray();
      expect(sortedByCode(entities)).toEqual(
        sortedByCode(
          getEntitiesWithFields(['BELL_TOWER', 'BURNED_TOWER'], ['code', 'name', 'type']),
        ),
      );
    });

    it('filters relatives when requested for some with access', async () => {
      const { text } = await app.post('hierarchy/goldsilver/relatives', {
        query: { fields: 'code,name,type' },
        body: { entities: ['LAVENDER', 'ECRUTEAK'] },
      });

      const entities = JSON.parse(text);
      expect(entities).toBeArray();
      expect(sortedByCode(entities)).toEqual(
        sortedByCode(
          getEntitiesWithFields(
            ['JOHTO', 'ECRUTEAK', 'BELL_TOWER', 'BURNED_TOWER'],
            ['code', 'name', 'type'],
          ),
        ),
      );
    });

    it('filters relationships when requested for some with access', async () => {
      const { text } = await app.post('hierarchy/goldsilver/relationships', {
        query: {
          fields: 'code,name,type',
          ancestor_filter: 'type==country',
          descendant_filter: 'type==facility',
          groupBy: 'descendant',
        },
        body: { entities: ['CINNABAR', 'CELADON', 'LAVENDER', 'ECRUTEAK'] },
      });

      const entities = JSON.parse(text);
      expect(entities).toEqual({
        BELL_TOWER: 'JOHTO',
        BURNED_TOWER: 'JOHTO',
      });
    });
  });
});
