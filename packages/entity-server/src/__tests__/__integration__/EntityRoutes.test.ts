/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TestableEntityServer, setupTestApp, tearDownTestApp } from '../testUtilities';
import { getEntitiesWithFields, getEntityWithFields, COUNTRIES } from './fixtures';

describe('entity', () => {
  let app: TestableEntityServer;

  beforeAll(async () => {
    app = await setupTestApp();
    app.grantAccessToCountries(COUNTRIES);
  });

  afterAll(() => tearDownTestApp(app));

  describe('/hierarchy/:hierarchyName/:entityCode', () => {
    it('can fetch a project entity', async () => {
      const { text } = await app.get('hierarchy/redblue/redblue', {
        query: { fields: 'code,name,type' },
      });

      const entity = JSON.parse(text);
      expect(entity).toEqual(getEntityWithFields('redblue', ['code', 'name', 'type']));
    });

    it('can fetch a country entity', async () => {
      const { text } = await app.get('hierarchy/redblue/KANTO', {
        query: { fields: 'code,name,type' },
      });

      const entity = JSON.parse(text);
      expect(entity).toEqual(getEntityWithFields('KANTO', ['code', 'name', 'type']));
    });

    it('can fetch a city entity', async () => {
      const { text } = await app.get('hierarchy/redblue/VIRIDIAN', {
        query: { fields: 'code,name,type' },
      });

      const entity = JSON.parse(text);
      expect(entity).toEqual(getEntityWithFields('VIRIDIAN', ['code', 'name', 'type']));
    });

    it('can fetch a facility entity', async () => {
      const { text } = await app.get('hierarchy/redblue/PKMN_TOWER', {
        query: { fields: 'code,name,type' },
      });

      const entity = JSON.parse(text);
      expect(entity).toEqual(getEntityWithFields('PKMN_TOWER', ['code', 'name', 'type']));
    });
  });

  describe('/hierarchy/:hierarchyName', () => {
    it('can fetch multiple entities', async () => {
      const { text } = await app.post('hierarchy/redblue', {
        query: { fields: 'code,name,type' },
        body: { entities: ['redblue', 'KANTO', 'VIRIDIAN', 'PKMN_TOWER'] },
      });

      const entities = JSON.parse(text);
      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(
          ['redblue', 'KANTO', 'VIRIDIAN', 'PKMN_TOWER'],
          ['code', 'name', 'type'],
        ),
      );
    });
  });
});
