import { TestableServer } from '@tupaia/server-boilerplate';
import { grantAccessToCountries, revokeCountryAccess, setupTestApp } from '../testUtilities';
import {
  getEntityWithFields,
  getEntitiesWithFields,
  ENTITIES,
  COUNTRIES,
  getHierarchiesWithFields,
} from './fixtures';

describe('fieldsAndFilters', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp();
    grantAccessToCountries(COUNTRIES);
  });

  afterAll(async () => {
    revokeCountryAccess();
  });

  it('fetches whole entity object by default', async () => {
    const { body: entity } = await app.get('hierarchy/redblue/KANTO');

    const { id, image_url: imageUrl, ...entityWithoutRandomFields } = entity;
    entityWithoutRandomFields.child_codes.sort();
    const fullEntityObject = {
      ...ENTITIES.find(e => e.code === 'KANTO'),
      point: null,
      region: null,
      bounds: null,
      location_type: 'no-coordinates',
      parent_code: 'redblue',
      parent_name: 'Pokemon Red/Blue',
      child_codes: [
        'LAVENDER',
        'VERMILLION',
        'PALLET',
        'CINNABAR',
        'PEWTER',
        'SAFFRON',
        'CELADON',
        'CERULEAN',
        'FUCHSIA',
        'VIRIDIAN',
      ].sort(),
      qualified_name: 'Kanto',
    };
    expect(entityWithoutRandomFields).toEqual(fullEntityObject);
  });

  describe('field', () => {
    it('throws error for unknown field', async () => {
      const { body: error } = await app.get('hierarchy/redblue/KANTO', {
        query: { field: 'fake_field' },
      });

      expect(error.error).toContain('Invalid single field requested fake_field');
    });

    it('throws error for unknown hierarchy field', async () => {
      const { body: error } = await app.get('hierarchies', {
        query: { field: 'fake_field' },
      });

      expect(error.error).toContain('Invalid single field requested fake_field');
    });

    it('throws error if requesting field for not flat property', async () => {
      const { body: error } = await app.get('hierarchy/redblue/KANTO', {
        query: { field: 'attributes' },
      });

      expect(error.error).toContain('Invalid single field requested attributes');
    });

    it('can fetch an entity as single field', async () => {
      const { body: entity } = await app.get('hierarchy/redblue/KANTO', {
        query: { field: 'name' },
      });

      expect(entity).toBe('Kanto');
    });

    it('can fetch multiple entities as single fields', async () => {
      const { body: entities } = await app.post('hierarchy/redblue', {
        query: { field: 'code' },
        body: { entities: ['redblue', 'KANTO', 'VIRIDIAN', 'PKMN_TOWER'] },
      });

      expect(entities).toIncludeSameMembers(['redblue', 'KANTO', 'VIRIDIAN', 'PKMN_TOWER']);
    });

    it('can fetch hierarchies as single field', async () => {
      const { body: hierarchies } = await app.get('hierarchies', {
        query: { field: 'name' },
      });

      expect(hierarchies).toIncludeSameMembers(['Pokemon Gold/Silver', 'Pokemon Red/Blue']);
    });
  });

  describe('fields', () => {
    it('throws error for unknown field', async () => {
      const { body: error } = await app.get('hierarchy/redblue/KANTO', {
        query: { fields: 'fake_field' },
      });

      expect(error.error).toContain('Unknown field requested: fake_field');
    });

    it('throws error for unknown hierarchy field', async () => {
      const { body: error } = await app.get('hierarchies', {
        query: { fields: 'fake_field' },
      });

      expect(error.error).toContain('Unknown field requested: fake_field');
    });

    it('can fetch an entity with specific fields', async () => {
      const { body: entity } = await app.get('hierarchy/redblue/KANTO', {
        query: { fields: 'name,attributes' },
      });

      expect(entity).toEqual(getEntityWithFields('KANTO', ['name', 'attributes']));
    });

    it('can fetch multiple entities with specific fields', async () => {
      const { body: entities } = await app.post('hierarchy/redblue', {
        query: { fields: 'code,type,attributes' },
        body: { entities: ['redblue', 'KANTO', 'VIRIDIAN', 'PKMN_TOWER'] },
      });

      expect(entities).toBeArray();
      expect(entities).toIncludeSameMembers(
        getEntitiesWithFields(
          ['redblue', 'KANTO', 'VIRIDIAN', 'PKMN_TOWER'],
          ['code', 'type', 'attributes'],
        ),
      );
    });

    it('can fetch hierarchies with specific fields', async () => {
      const { body: hierarchies } = await app.get('hierarchies', {
        query: { fields: 'code,name' },
      });

      expect(hierarchies).toBeArray();
      expect(hierarchies).toIncludeSameMembers(
        getHierarchiesWithFields(['goldsilver', 'redblue'], ['code', 'name']),
      );
    });
  });

  describe('hierarchy dependant fields', () => {
    it('parent_code depends on hierarchy used', async () => {
      const { body: rbEntity } = await app.get('hierarchy/redblue/BLUE', {
        query: { fields: 'code,parent_code' },
      });

      expect(rbEntity).toEqual({ code: 'BLUE', parent_code: 'PALLET' });

      const { body: gsEntity } = await app.get('hierarchy/goldsilver/BLUE', {
        query: { fields: 'code,parent_code' },
      });

      expect(gsEntity).toEqual({ code: 'BLUE', parent_code: 'VIRIDIAN' });
    });

    it('child_codes depends on hierarchy used', async () => {
      const { body: rbEntity } = await app.get('hierarchy/redblue/LAVENDER', {
        query: { fields: 'code,child_codes' },
      });

      expect(rbEntity).toEqual({ code: 'LAVENDER', child_codes: ['PKMN_TOWER'] });

      const { body: gsEntity } = await app.get('hierarchy/goldsilver/LAVENDER', {
        query: { fields: 'code,child_codes' },
      });

      expect(gsEntity).toEqual({ code: 'LAVENDER', child_codes: ['LAVENDER_RADIO_TOWER'] });
    });
  });

  describe('filter', () => {
    it('throws error for unknown field', async () => {
      const { body: error } = await app.get('hierarchy/redblue/KANTO', {
        query: { filter: 'fake_field==fake_value' },
      });

      expect(error.error).toContain('Unknown filter key ‘fake_field’');
    });

    it('it can filter on equality', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'type==facility' },
      });

      expect(entities).toIncludeSameMembers([
        'CELADON_GAME',
        'CERULEAN_CAVE',
        'PKMN_MANSION',
        'PKMN_TOWER',
        'SAFARI',
        'SILPH',
      ]);
    });

    it('it can filter on inequality', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'type!=facility' },
      });

      expect(entities).toIncludeSameMembers([
        'BLUE',
        'CELADON',
        'CERULEAN',
        'CINNABAR',
        'FUCHSIA',
        'KANTO',
        'LAVENDER',
        'PALLET',
        'PEWTER',
        'SAFFRON',
        'VERMILLION',
        'VIRIDIAN',
      ]);
    });

    it('it can filter on likeness', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'name=@Pokemon' },
      });

      expect(entities).toIncludeSameMembers(['PKMN_MANSION', 'PKMN_TOWER']);
    });

    it('it can filter using <', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'generational_distance<2' },
      });

      expect(entities).toIncludeSameMembers(['KANTO']);
    });

    it('it can filter using <=', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'generational_distance<=2' },
      });

      expect(entities).toIncludeSameMembers([
        'CELADON',
        'CERULEAN',
        'CINNABAR',
        'FUCHSIA',
        'KANTO',
        'LAVENDER',
        'PALLET',
        'PEWTER',
        'SAFFRON',
        'VERMILLION',
        'VIRIDIAN',
      ]);
    });

    it('it can filter using >', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'name>Saffron City' },
      });

      expect(entities).toIncludeSameMembers(['BLUE', 'SILPH', 'VERMILLION', 'VIRIDIAN']);
    });

    it('it can filter using >=', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'name>=Saffron City' },
      });

      expect(entities).toIncludeSameMembers(['BLUE', 'SAFFRON', 'SILPH', 'VERMILLION', 'VIRIDIAN']);
    });

    it('it can filter on deep properties of object properties', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'attributes->>type==gym' },
      });

      expect(entities).toIncludeSameMembers([
        'CINNABAR',
        'SAFFRON',
        'FUCHSIA',
        'CELADON',
        'VERMILLION',
        'PEWTER',
        'CERULEAN',
        'VIRIDIAN',
      ]);
    });

    it('it can filter nested attributes', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'attributes->>gym->>type==fire' },
      });

      expect(entities).toIncludeSameMembers(['VIRIDIAN']);
    });

    it('it can filter for multiple properties', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'type!=facility;name=@City' },
      });

      expect(entities).toIncludeSameMembers([
        'SAFFRON',
        'FUCHSIA',
        'CELADON',
        'VERMILLION',
        'CERULEAN',
        'PEWTER',
        'VIRIDIAN',
      ]);
    });

    it('array filtering uses IN logic for ==', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'type==individual,country' },
      });

      expect(entities).toIncludeSameMembers(['BLUE', 'KANTO']);
    });

    it('array filtering uses NOT IN logic for !=', async () => {
      const { body: entities } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'type!=facility,country' },
      });

      // type = city || individual
      expect(entities).toIncludeSameMembers([
        'PALLET',
        'VIRIDIAN',
        'PEWTER',
        'CERULEAN',
        'VERMILLION',
        'LAVENDER',
        'CELADON',
        'FUCHSIA',
        'SAFFRON',
        'CINNABAR',
        'BLUE',
      ]);
    });

    it('throws error if multiple values are passed for an incompatible operator', async () => {
      const { body: error } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'generational_distance<1,2' },
      });

      expect(error.error).toContain('Operator < is not compatible with multiple filter values');
    });
  });
});
