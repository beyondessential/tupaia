import { getEntitiesWithFields } from './fixtures';
import { setupTestData } from './setup';
import { getTestModels } from '../../../server/testUtilities';

describe('EntityDescendants', () => {
  let models;
  beforeAll(async () => {
    models = getTestModels();
    await setupTestData(models);
  });

  const getHierarchyByName = async name => {
    return await models.entityHierarchy.findOne({ name });
  };

  const getEntityByCode = async code => {
    return await models.entity.findOne({ code });
  };

  const removeEmptyFields = ({ model: _, ...entity }) => {
    return Object.fromEntries(
      Object.entries(entity).filter(([_key, value]) => value !== undefined),
    );
  };

  it('can fetch descendants of an entity', async () => {
    const hierarchyId = (await getHierarchyByName('redblue')).id;
    const entityId = (await getEntityByCode('LAVENDER')).id;
    const entities = await models.entity.getDescendantsFromParentChildRelation(
      hierarchyId,
      [entityId],
      {
        fields: ['code', 'name', 'type'],
      },
    );

    expect(entities).toBeArray();
    expect(entities.map(removeEmptyFields)).toIncludeSameMembers(
      getEntitiesWithFields(['PKMN_TOWER'], ['code', 'name', 'type']),
    );
  });

  it('can fetch descendants of a project entity', async () => {
    const hierarchyId = (await getHierarchyByName('redblue')).id;
    const entityId = (await getEntityByCode('redblue')).id;
    const entities = await models.entity.getDescendantsFromParentChildRelation(
      hierarchyId,
      [entityId],
      {
        fields: ['code', 'name', 'type'],
      },
    );
    expect(entities).toBeArray();
    expect(entities.map(removeEmptyFields)).toIncludeSameMembers(
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
    const hierarchyId = (await getHierarchyByName('goldsilver')).id;
    const entityId = (await getEntityByCode('goldsilver')).id;
    const entities = await models.entity.getDescendantsFromParentChildRelation(
      hierarchyId,
      [entityId],
      {
        fields: ['code', 'name', 'type'],
      },
    );

    expect(entities).toBeArray();
    expect(entities.map(removeEmptyFields)).toIncludeSameMembers(
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
    const hierarchyId = (await getHierarchyByName('redblue')).id;
    const entityId = (await getEntityByCode('KANTO')).id;
    const entities = await models.entity.getDescendantsFromParentChildRelation(
      hierarchyId,
      [entityId],
      {
        fields: ['code', 'name', 'type'],
      },
    );

    expect(entities).toBeArray();
    expect(entities.map(removeEmptyFields)).toIncludeSameMembers(
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

  it('can filter by type', async () => {
    const hierarchyId = (await getHierarchyByName('redblue')).id;
    const entityId = (await getEntityByCode('KANTO')).id;
    const entities = await models.entity.getDescendantsFromParentChildRelation(
      hierarchyId,
      [entityId],
      {
        fields: ['code', 'name', 'type'],
        filter: {
          type: 'city',
        },
      },
    );

    expect(entities).toBeArray();
    expect(entities.map(removeEmptyFields).every(entity => entity.type === 'city')).toBe(true);
  });

  it('can filter by generational distance', async () => {
    const hierarchyId = (await getHierarchyByName('redblue')).id;
    const entityId = (await getEntityByCode('KANTO')).id;
    const entities = await models.entity.getDescendantsFromParentChildRelation(
      hierarchyId,
      [entityId],
      {
        fields: ['code', 'name', 'type'],
        filter: {
          generational_distance: 2,
        },
      },
    );

    expect(entities).toBeArray();

    // 2 generations down from KANTO
    expect(entities.map(removeEmptyFields)).toIncludeSameMembers(
      getEntitiesWithFields(
        ['BLUE', 'CELADON_GAME', 'SAFARI', 'CERULEAN_CAVE', 'PKMN_TOWER', 'SILPH', 'PKMN_MANSION'],
        ['code', 'name', 'type'],
      ),
    );
  });
});
