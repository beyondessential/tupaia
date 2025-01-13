import { TestableServer } from '@tupaia/server-boilerplate';
import { grantAccess, revokeCountryAccess, setupTestApp } from '../testUtilities';
import { getEntitiesWithFields, getHierarchiesWithFields } from './fixtures';

describe('permissions', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp();
    grantAccess({ JOHTO: ['Public'], KANTO: ['Team Rocket'] });
  });

  afterAll(async () => {
    revokeCountryAccess();
  });

  describe('no access', () => {
    it('throws error if fetching project with no access to any of its countries', async () => {
      const { body: error } = await app.get('hierarchy/redblue/redblue', {
        query: { fields: 'code,name,type' },
      });

      expect(error.error).toContain('No access to requested entities: redblue');
    });

    it('throws error if fetching country with no access', async () => {
      const { body: error } = await app.get('hierarchy/redblue/KANTO', {
        query: { fields: 'code,name,type' },
      });

      expect(error.error).toContain('No access to requested entities: KANTO');
    });

    it('throws error if fetching city with no access to country', async () => {
      const { body: error } = await app.get('hierarchy/redblue/CELADON', {
        query: { fields: 'code,name,type' },
      });

      expect(error.error).toContain('No access to requested entities: CELADON');
    });
  });

  describe('filtering entities by access', () => {
    it('filters entities when requested for some with access', async () => {
      const { body: entities } = await app.post('hierarchy/goldsilver', {
        query: { fields: 'code,name,type' },
        body: { entities: ['KANTO', 'VIRIDIAN', 'ECRUTEAK', 'SLOWPOKE_WELL'] },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(['ECRUTEAK', 'SLOWPOKE_WELL'], ['code', 'name', 'type']),
      );
    });

    it('filters descendants when requested for some with access', async () => {
      const { body: entities } = await app.post('hierarchy/goldsilver/descendants', {
        query: { fields: 'code,name,type' },
        body: { entities: ['LAVENDER', 'ECRUTEAK'] },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(['BELL_TOWER', 'BURNED_TOWER'], ['code', 'name', 'type']),
      );
    });

    it('does not filter descendants when requested with isPublic option', async () => {
      const { body: entities } = await app.post('hierarchy/goldsilver/descendants?isPublic=true', {
        query: { fields: 'code,name,type' },
        body: { entities: ['LAVENDER', 'ECRUTEAK'] },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(
          ['LAVENDER_RADIO_TOWER', 'BELL_TOWER', 'BURNED_TOWER'],
          ['code', 'name', 'type'],
        ),
      );
    });

    it('filters relatives when requested for some with access', async () => {
      const { body: entities } = await app.post('hierarchy/goldsilver/relatives', {
        query: { fields: 'code,name,type' },
        body: { entities: ['LAVENDER', 'ECRUTEAK'] },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(
          ['JOHTO', 'ECRUTEAK', 'BELL_TOWER', 'BURNED_TOWER'],
          ['code', 'name', 'type'],
        ),
      );
    });

    it('filters relationships when requested for some with access', async () => {
      const { body: entities } = await app.post('hierarchy/goldsilver/relationships', {
        query: {
          fields: 'code,name,type',
          ancestor_filter: 'type==country',
          descendant_filter: 'type==facility',
          groupBy: 'descendant',
        },
        body: { entities: ['CINNABAR', 'CELADON', 'LAVENDER', 'ECRUTEAK'] },
      });

      expect(entities).toEqual({
        BELL_TOWER: 'JOHTO',
        BURNED_TOWER: 'JOHTO',
      });
    });

    it('filters hierarchies when requested for some with access', async () => {
      const { body: hierarchies } = await app.get('hierarchies', {
        query: { fields: 'code,name' },
      });

      expect(hierarchies).toBeArray();
      expect(hierarchies).toIncludeSameMembers(
        getHierarchiesWithFields(['goldsilver'], ['code', 'name']),
      );
    });
  });
});
