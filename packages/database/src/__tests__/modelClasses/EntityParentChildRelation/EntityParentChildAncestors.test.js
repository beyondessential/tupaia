import { entityHierarchyFixtures } from '../../../server/testFixtures';
import { setupTestData } from './setup';
import { getTestModels } from '../../../server/testUtilities';
import { getHierarchyByName, getEntityByCode, removeEmptyFields } from './utils';

const { getEntitiesWithFields } = entityHierarchyFixtures;

describe('EntityParentChildAncestors', () => {
  let models;
  beforeAll(async () => {
    models = getTestModels();
    await setupTestData(models);
  });

  it('fetch ancestors of a country entity', async () => {
    const hierarchyId = (await getHierarchyByName(models, 'redblue')).id;
    const entityId = (await getEntityByCode(models, 'KANTO')).id;
    const entities = await models.entity.getAncestorsFromParentChildRelation(
      hierarchyId,
      [entityId],
      {
        fields: ['code', 'name', 'type'],
      },
    );

    expect(entities).toBeArray();
    expect(entities.map(removeEmptyFields)).toIncludeSameMembers(
      getEntitiesWithFields(['redblue'], ['code', 'name', 'type']),
    );
  });

  it('fetch ancestors of a city entity', async () => {
    const hierarchyId = (await getHierarchyByName(models, 'redblue')).id;
    const entityId = (await getEntityByCode(models, 'CELADON')).id;
    const entities = await models.entity.getAncestorsFromParentChildRelation(
      hierarchyId,
      [entityId],
      {
        fields: ['code', 'name', 'type'],
      },
    );

    expect(entities).toBeArray();
    expect(entities.map(removeEmptyFields)).toIncludeSameMembers(
      getEntitiesWithFields(['KANTO', 'redblue'], ['code', 'name', 'type']),
    );
  });

  it('fetch ancestors of a facility entity', async () => {
    const hierarchyId = (await getHierarchyByName(models, 'redblue')).id;
    const entityId = (await getEntityByCode(models, 'CELADON_GAME')).id;
    const entities = await models.entity.getAncestorsFromParentChildRelation(
      hierarchyId,
      [entityId],
      {
        fields: ['code', 'name', 'type'],
      },
    );

    expect(entities).toBeArray();
    expect(entities.map(removeEmptyFields)).toIncludeSameMembers(
      getEntitiesWithFields(['CELADON', 'KANTO', 'redblue'], ['code', 'name', 'type']),
    );
  });

  it('filter by type', async () => {
    const hierarchyId = (await getHierarchyByName(models, 'redblue')).id;
    const entityId = (await getEntityByCode(models, 'BLUE')).id;
    const entities = await models.entity.getAncestorsFromParentChildRelation(
      hierarchyId,
      [entityId],
      {
        fields: ['code', 'name', 'type'],
        filter: {
          type: 'country',
        },
      },
    );

    expect(entities).toBeArray();
    expect(entities.map(removeEmptyFields).every(entity => entity.type === 'country')).toBe(true);
  });

  it('filter by generational distance', async () => {
    const hierarchyId = (await getHierarchyByName(models, 'redblue')).id;
    const entityId = (await getEntityByCode(models, 'CERULEAN_CAVE')).id;
    const entities = await models.entity.getAncestorsFromParentChildRelation(
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

    // 2 generations up from CERULEAN_CAVE
    expect(entities.map(removeEmptyFields)).toIncludeSameMembers(
      getEntitiesWithFields(['KANTO'], ['code', 'name', 'type']),
    );
  });
});
