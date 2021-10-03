/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TestableEntityServer, setupTestApp, tearDownTestApp } from '../testUtilities';
import { getEntityWithFields, getEntitiesWithFields, ENTITIES, COUNTRIES } from './fixtures';

describe('fieldsAndFilters', () => {
  let app: TestableEntityServer;

  beforeAll(async () => {
    app = await setupTestApp();
    app.grantAccessToCountries(COUNTRIES);
  });

  afterAll(async () => {
    await tearDownTestApp(app);
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

    it('throws error if requesting field for not flat property', async () => {
      const { body: error } = await app.get('hierarchy/redblue/KANTO', {
        query: { field: 'attributes' },
      });

      expect(error.error).toContain('Invalid single field requested attributes');
    });

    it('can fetch a an entity as single field', async () => {
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
  });

  describe('fields', () => {
    it('throws error for unknown field', async () => {
      const { body: error } = await app.get('hierarchy/redblue/KANTO', {
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

    it('can multiple entities with specific fields', async () => {
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

      expect(error.error).toContain('Unknown filter key: fake_field');
    });

    it('it can filter on equality', async () => {
      const { body: entity } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'type==facility' },
      });

      expect(entity.sort()).toEqual(
        ['CELADON_GAME', 'CERULEAN_CAVE', 'PKMN_MANSION', 'PKMN_TOWER', 'SAFARI', 'SILPH'].sort(),
      );
    });

    it('it can filter on inequality', async () => {
      const { body: entity } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'type!=facility' },
      });

      expect(entity.sort()).toEqual(
        [
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
        ].sort(),
      );
    });

    it('it can filter on likeness', async () => {
      const { body: entity } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'name=@Pokemon' },
      });

      expect(entity.sort()).toEqual(['PKMN_MANSION', 'PKMN_TOWER'].sort());
    });

    it('it can filter on deep properties of object properties', async () => {
      const { body: entity } = await app.get('hierarchy/redblue/redblue/descendants', {
        query: { field: 'code', filter: 'attributes_type==gym' },
      });

      expect(entity.sort()).toEqual(
        [
          'CINNABAR',
          'SAFFRON',
          'FUCHSIA',
          'CELADON',
          'VERMILLION',
          'PEWTER',
          'CERULEAN',
          'VIRIDIAN',
        ].sort(),
      );
    });
  });
});
