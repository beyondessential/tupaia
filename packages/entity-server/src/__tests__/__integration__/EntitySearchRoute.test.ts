/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { TestableServer } from '@tupaia/server-boilerplate';
import { grantAccessToCountries, revokeCountryAccess, setupTestApp } from '../testUtilities';
import { getEntitiesWithFields, COUNTRIES } from './fixtures';

describe('entitySearch', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp();
    grantAccessToCountries(COUNTRIES);
  });

  afterAll(async () => {
    revokeCountryAccess();
  });

  describe('/hierarchy/:hierarchyName/entitySearch/:searchString', () => {
    it('search for a entity within hierarchy', async () => {
      const { body: entities } = await app.get('hierarchy/goldsilver/entitySearch/cela', {
        query: { fields: 'code,name' },
      });

      expect(entities).toBeArray();
      expect(entities).toEqual(
        getEntitiesWithFields(['CELADON', 'CELADON_GAME'], ['code', 'name']),
      );
    });

    it('group entities that start with the string first', async () => {
      const { body: entities } = await app.get('hierarchy/goldsilver/entitySearch/la', {
        query: { fields: 'code,name' },
      });

      expect(entities).toBeArray();
      expect(entities).toEqual(
        getEntitiesWithFields(
          // 'La'vender Radio Tower, 'La'vender Town, B'la'ckthorn City,
          // Ce'la'don City, Ce'la'don Game Corner
          ['LAVENDER_RADIO_TOWER', 'LAVENDER', 'BLACKTHORN', 'CELADON', 'CELADON_GAME'],
          ['code', 'name'],
        ),
      );
    });

    it('paginate results', async () => {
      const { body: entities } = await app.get('hierarchy/goldsilver/entitySearch/la', {
        query: { fields: 'code,name', pageSize: 2 },
      });

      expect(entities).toBeArray();
      expect(entities).toEqual(
        getEntitiesWithFields(
          // 'La'vender Radio Tower, 'La'vender Town
          ['LAVENDER_RADIO_TOWER', 'LAVENDER'],
          ['code', 'name'],
        ),
      );
    });

    it('request non-zero page', async () => {
      const { body: entities } = await app.get('hierarchy/goldsilver/entitySearch/la', {
        query: { fields: 'code,name', pageSize: 2, page: 1 },
      });

      expect(entities).toBeArray();
      expect(entities).toEqual(
        getEntitiesWithFields(
          // B'la'ckthorn City, Ce'la'don City
          ['BLACKTHORN', 'CELADON'],
          ['code', 'name'],
        ),
      );
    });
  });
});
