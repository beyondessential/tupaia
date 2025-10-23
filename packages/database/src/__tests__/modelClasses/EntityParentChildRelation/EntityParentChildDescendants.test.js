import { entityHierarchyFixtures } from '../../../server/testFixtures';
import { setupTestData } from './setup';
import { getTestModels } from '../../../server/testUtilities';
import { getHierarchyByName, getEntityByCode, removeEmptyFields } from './utils';

const { getEntitiesWithFields } = entityHierarchyFixtures;

describe('EntityParentChildDescendants ', () => {
  let models;
  beforeAll(async () => {
    models = getTestModels();
    await setupTestData(models);
  });

  it('fetch descendants of an entity', async () => {
    const hierarchyId = (await getHierarchyByName(models, 'redblue')).id;
    const entityId = (await getEntityByCode(models, 'LAVENDER')).id;
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

  it('fetch descendants of a project entity', async () => {
    const hierarchyId = (await getHierarchyByName(models, 'redblue')).id;
    const entityId = (await getEntityByCode(models, 'redblue')).id;
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

  it('fetch descendants of a alternate project entity', async () => {
    const hierarchyId = (await getHierarchyByName(models, 'goldsilver')).id;
    const entityId = (await getEntityByCode(models, 'goldsilver')).id;
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

  it('fetch descendants of a country entity', async () => {
    const hierarchyId = (await getHierarchyByName(models, 'redblue')).id;
    const entityId = (await getEntityByCode(models, 'KANTO')).id;
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

  it('filter by type', async () => {
    const hierarchyId = (await getHierarchyByName(models, 'redblue')).id;
    const entityId = (await getEntityByCode(models, 'KANTO')).id;
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

  it('filter by generational distance', async () => {
    const hierarchyId = (await getHierarchyByName(models, 'redblue')).id;
    const entityId = (await getEntityByCode(models, 'KANTO')).id;
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
