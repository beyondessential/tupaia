import { TestableServer } from '@tupaia/server-boilerplate';
import { grantAccessToCountries, revokeCountryAccess, setupTestApp } from '../testUtilities';
import { getEntitiesWithFields, COUNTRIES } from './fixtures';

describe('descendants', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp();
    grantAccessToCountries(COUNTRIES);
  });

  afterAll(async () => {
    revokeCountryAccess();
  });

  describe('/hierarchy/:hierarchyName/:entityCode/descendants', () => {
    it('can include the root entity', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/LAVENDER/descendants', {
        query: { fields: 'code,name,type', includeRootEntity: 'true' },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(['LAVENDER', 'PKMN_TOWER'], ['code', 'name', 'type']),
      );
    });

    it('can fetch descendants of a project entity', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { fields: 'code,name,type' },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(
          [
            'KANTO',
            'PALLET',
            'BLUE',
            'VIRIDIAN',
            'PEWTER',
            'CERULEAN',
            'CERULEAN_CAVE',
            'VERMILLION',
            'LAVENDER',
            'PKMN_TOWER',
            'CELADON',
            'CELADON_GAME',
            'FUCHSIA',
            'SAFARI',
            'SAFFRON',
            'SILPH',
            'CINNABAR',
            'PKMN_MANSION',
          ],
          ['code', 'name', 'type'],
        ),
      );
    });

    it('can fetch descendants of a alternate project entity', async () => {
      const { body: entities } = await app.get('hierarchy/goldsilver/goldsilver/descendants', {
        query: { fields: 'code,name,type' },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(
          [
            'SPROUT_TOWER',
            'OLIVINE_LIGHTHOUSE',
            'LAVENDER_RADIO_TOWER',
            'CELADON_GAME',
            'SLOWPOKE_WELL',
            'DRAGONS_DEN',
            'BELL_TOWER',
            'CERULEAN_CAVE',
            'BURNED_TOWER',
            'GOLDENROD',
            'NEWBARK',
            'VERMILLION',
            'MAHOGANY',
            'CHERRYGROVE',
            'VIOLET',
            'CIANWOOD',
            'CELADON',
            'AZALEA',
            'BLACKTHORN',
            'PALLET',
            'SAFFRON',
            'ECRUTEAK',
            'PEWTER',
            'OLIVINE',
            'CERULEAN',
            'SILPH',
            'VIRIDIAN',
            'BLUE',
            'FUCHSIA',
            'LAVENDER',
            'KANTO',
            'JOHTO',
          ],
          ['code', 'name', 'type'],
        ),
      );
    });

    it('can fetch descendants of a country entity', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/KANTO/descendants', {
        query: { fields: 'code,name,type' },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(
          [
            'PALLET',
            'BLUE',
            'VIRIDIAN',
            'PEWTER',
            'CERULEAN',
            'CERULEAN_CAVE',
            'VERMILLION',
            'LAVENDER',
            'PKMN_TOWER',
            'CELADON',
            'CELADON_GAME',
            'FUCHSIA',
            'SAFARI',
            'SAFFRON',
            'SILPH',
            'CINNABAR',
            'PKMN_MANSION',
          ],
          ['code', 'name', 'type'],
        ),
      );
    });

    it('can fetch descendants of a city entity', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/CELADON/descendants', {
        query: { fields: 'code,name,type' },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(['CELADON_GAME'], ['code', 'name', 'type']),
      );
    });

    it('can fetch descendants of a facility entity', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/CELADON_GAME/descendants', {
        query: { fields: 'code,name,type' },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(getEntitiesWithFields([], ['code', 'name', 'type']));
    });

    it('can limit by page size', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/KANTO/descendants', {
        query: {
          fields: 'code,name',
          filter: 'type==city',
          pageSize: 5,
        },
      });

      expect(entities).toBeArray();
      expect(entities.length).toBe(5);
    });
  });

  describe('/hierarchy/:hierarchyName/descendants', () => {
    it('can fetch descendants of multiple entities', async () => {
      const { body: entities } = await app.post('hierarchy/redblue/descendants', {
        query: { fields: 'code,name,type' },
        body: { entities: ['CINNABAR', 'CELADON', 'LAVENDER'] },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(
          ['CELADON_GAME', 'PKMN_MANSION', 'PKMN_TOWER'],
          ['code', 'name', 'type'],
        ),
      );
    });

    it('can fetch descendants of no entities', async () => {
      const { body: entities } = await app.post('hierarchy/redblue/descendants', {
        query: { fields: 'code,name,type' },
        body: { entities: [] },
      });

      expect(entities).toBeArray();
      expect(entities.length).toBe(0);
    });

    it('can fetch descendants of multiple entities for an alternate hierarchy', async () => {
      const { body: entities } = await app.post('hierarchy/goldsilver/descendants', {
        query: { fields: 'code,name,type' },
        body: { entities: ['CINNABAR', 'CELADON', 'LAVENDER', 'ECRUTEAK'] },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(
          ['CELADON_GAME', 'LAVENDER_RADIO_TOWER', 'BELL_TOWER', 'BURNED_TOWER'],
          ['code', 'name', 'type'],
        ),
      );
    });
  });
});
