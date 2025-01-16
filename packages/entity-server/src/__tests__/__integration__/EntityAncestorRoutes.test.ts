import { TestableServer } from '@tupaia/server-boilerplate';
import { grantAccessToCountries, revokeCountryAccess, setupTestApp } from '../testUtilities';
import { getEntitiesWithFields, COUNTRIES } from './fixtures';

describe('ancestors', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp();
    grantAccessToCountries(COUNTRIES);
  });

  afterAll(async () => {
    revokeCountryAccess();
  });

  describe('/hierarchy/:hierarchyName/:entityCode/ancestors', () => {
    it('can include the root entity', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/LAVENDER/ancestors', {
        query: { fields: 'code,name,type', includeRootEntity: 'true' },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(['LAVENDER', 'KANTO'], ['code', 'name', 'type']),
      );
    });

    it('can fetch ancestors of a country entity', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/KANTO/ancestors', {
        query: { fields: 'code,name,type' },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(getEntitiesWithFields([], ['code', 'name', 'type']));
    });

    it('can fetch ancestors of a city entity', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/CELADON/ancestors', {
        query: { fields: 'code,name,type' },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(['KANTO'], ['code', 'name', 'type']),
      );
    });

    it('can fetch ancestors of a facility entity', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/CELADON_GAME/ancestors', {
        query: { fields: 'code,name,type' },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(['CELADON', 'KANTO'], ['code', 'name', 'type']),
      );
    });
  });

  describe('/hierarchy/:hierarchyName/ancestors', () => {
    it('can fetch ancestors of multiple entities', async () => {
      const { body: entities } = await app.post('hierarchy/redblue/ancestors', {
        query: { fields: 'code,name,type' },
        body: { entities: ['CELADON_GAME', 'PKMN_MANSION', 'PKMN_TOWER'] },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(
          ['CINNABAR', 'CELADON', 'LAVENDER', 'KANTO'],
          ['code', 'name', 'type'],
        ),
      );
    });

    it('can fetch ancestors of no entities', async () => {
      const { body: entities } = await app.post('hierarchy/redblue/ancestors', {
        query: { fields: 'code,name,type' },
        body: { entities: [] },
      });

      expect(entities).toBeArray();
      expect(entities.length).toBe(0);
    });

    it('can fetch ancestors of multiple entities for an alternate hierarchy', async () => {
      const { body: entities } = await app.post('hierarchy/goldsilver/ancestors', {
        query: { fields: 'code,name,type' },
        body: { entities: ['CELADON_GAME', 'LAVENDER_RADIO_TOWER', 'BELL_TOWER', 'BURNED_TOWER'] },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(
          ['CELADON', 'LAVENDER', 'ECRUTEAK', 'JOHTO', 'KANTO'],
          ['code', 'name', 'type'],
        ),
      );
    });
  });
});
