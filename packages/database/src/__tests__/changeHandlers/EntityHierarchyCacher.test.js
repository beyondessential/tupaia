import {
  getTestModels,
  populateTestData,
  clearTestData,
  upsertDummyRecord,
} from '../../server/testUtilities';
import { EntityHierarchyCacher } from '../../server/changeHandlers';
import { EntityHierarchySubtreeRebuilder } from '../../server/changeHandlers/entityHierarchyCacher/EntityHierarchySubtreeRebuilder';
import {
  TEST_DATA,
  INITIAL_HIERARCHY_OCEAN,
  INITIAL_HIERARCHY_STORM,
  INITIAL_HIERARCHY_WIND,
  HIERARCHY_STORM_AFTER_ENTITY_AAA_DELETED,
  HIERARCHY_STORM_AFTER_MULTIPLE_ENTITIES_DELETED,
  HIERARCHY_STORM_AFTER_RELATION_ABA_AAA_DELETED,
  HIERARCHY_STORM_AFTER_MULTIPLE_RELATIONS_DELETED,
  HIERARCHY_OCEAN_AFTER_PARENT_ID_CHANGES,
  HIERARCHY_STORM_AFTER_PARENT_ID_CHANGES,
  HIERARCHY_STORM_AFTER_RELATION_HIERARCHY_CHANGED,
  HIERARCHY_STORM_AFTER_RELATION_PARENT_ID_CHANGED_1,
  HIERARCHY_STORM_AFTER_RELATION_PARENT_ID_CHANGED_2,
  HIERARCHY_STORM_AFTER_MULTIPLE_RELATIONS_CHANGED,
  HIERARCHY_STORM_AFTER_ENTITY_RELATION_ADDED,
  HIERARCHY_OCEAN_AFTER_ENTITIES_CREATED,
  HIERARCHY_STORM_AFTER_ENTITIES_CREATED,
  HIERARCHY_WIND_AFTER_CANONICAL_TYPES_CHANGED,
} from './EntityHierarchyCacher.fixtures';

const TEST_DEBOUNCE_TIME = 50; // short debounce time so tests run more quickly

describe('EntityHierarchyCacher', () => {
  const models = getTestModels();
  const hierarchyCacher = new EntityHierarchyCacher(models);
  hierarchyCacher.setDebounceTime(TEST_DEBOUNCE_TIME); // short debounce time so tests run more quickly

  const buildAndCacheProject = async projectCode => {
    const project = await models.project.findOne({ code: projectCode });
    await models.wrapInTransaction(async transactingModels => {
      const subtreeRebuilder = new EntityHierarchySubtreeRebuilder(transactingModels);
      await subtreeRebuilder.buildAndCacheProject(project);
    });
  };
  const assertRelationsMatch = async (projectCode, expectedAncestorDescendantRelations) => {
    await models.database.waitForAllChangeHandlers();
    const project = await models.project.findOne({ code: projectCode });
    const { entity_hierarchy_id: hierarchyId } = project;
    const ancestorDescendantRelationsForProject = await models.ancestorDescendantRelation.find({
      entity_hierarchy_id: hierarchyId,
    });
    const parentChildRelationsForProject = await models.entityParentChildRelation.find({
      entity_hierarchy_id: hierarchyId,
    });

    // Get the expected entity_parent_child_relation
    // ie: the expected ancestor descendant relations that have a generational distance of 1
    const expectedParentChildRelations = expectedAncestorDescendantRelations
      .filter(({ generational_distance }) => generational_distance === 1)
      .map(({ ancestor_id, descendant_id }) => ({
        parent_id: ancestor_id,
        child_id: descendant_id,
      }));

    expect(
      parentChildRelationsForProject.map(r => ({
        parent_id: r.parent_id,
        child_id: r.child_id,
      })),
    ).toIncludeSameMembers(expectedParentChildRelations);
    expect(
      ancestorDescendantRelationsForProject.map(r => ({
        ancestor_id: r.ancestor_id,
        descendant_id: r.descendant_id,
        generational_distance: r.generational_distance,
      })),
    ).toIncludeSameMembers(expectedAncestorDescendantRelations);
  };

  beforeEach(async () => {
    await populateTestData(models, TEST_DATA);
    await buildAndCacheProject('project_ocean_test');
    await buildAndCacheProject('project_storm_test');

    // start listening for changes
    hierarchyCacher.listenForChanges();
  });

  afterEach(async () => {
    hierarchyCacher.stopListeningForChanges();
    await clearTestData(models.database);
  });

  it('deletes and rebuilds subtrees across all hierarchies if a parent_id is changed', async () => {
    // update the parent_id of an entity, and make sure the subtree in the database is rebuilt
    await models.entity.updateById('entity_aaa_test', { parent_id: 'entity_a_test' });
    await models.entity.updateById('entity_abb_test', { parent_id: 'entity_aaa_test' });
    console.log('no canonical types', await models.entity.find({ parent_id: 'entity_a_test' }));

    await assertRelationsMatch('project_ocean_test', HIERARCHY_OCEAN_AFTER_PARENT_ID_CHANGES);
    // await assertRelationsMatch('project_storm_test', HIERARCHY_STORM_AFTER_PARENT_ID_CHANGES);
  });
});
