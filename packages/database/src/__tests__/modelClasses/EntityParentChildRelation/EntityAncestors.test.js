import { entityHierarchyFixtures } from '../../../server/testFixtures';
import { setupTestData } from './setup';
import { getTestModels } from '../../../server/testUtilities';

const { getEntitiesWithFields } = entityHierarchyFixtures;

describe('EntityAncestors', () => {
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

  it('can fetch ancestors of a country entity', async () => {
    const hierarchyId = (await getHierarchyByName('redblue')).id;
    const entityId = (await getEntityByCode('KANTO')).id;
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

  it('can fetch ancestors of a city entity', async () => {
    const hierarchyId = (await getHierarchyByName('redblue')).id;
    const entityId = (await getEntityByCode('CELADON')).id;
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

  it('can fetch ancestors of a facility entity', async () => {
    const hierarchyId = (await getHierarchyByName('redblue')).id;
    const entityId = (await getEntityByCode('CELADON_GAME')).id;
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

  it('can filter by type', async () => {
    const hierarchyId = (await getHierarchyByName('redblue')).id;
    const entityId = (await getEntityByCode('BLUE')).id;
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

  it('can filter by generational distance', async () => {
    const hierarchyId = (await getHierarchyByName('redblue')).id;
    const entityId = (await getEntityByCode('CERULEAN_CAVE')).id;
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
