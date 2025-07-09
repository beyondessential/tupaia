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
  const subtreeRebuilder = new EntityHierarchySubtreeRebuilder(models);
  hierarchyCacher.setDebounceTime(TEST_DEBOUNCE_TIME); // short debounce time so tests run more quickly

  const buildAndCacheProject = async projectCode => {
    const project = await models.project.findOne({ code: projectCode });
    await subtreeRebuilder.buildAndCacheProject(project);
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

  describe('buildAndCacheProject', () => {
    const assertProjectRelationsCorrectlyBuilt = async (projectCode, expected) => {
      await assertRelationsMatch(projectCode, expected);
    };

    it('handles a hierarchy that is fully canonical', async () => {
      await assertProjectRelationsCorrectlyBuilt('project_ocean_test', INITIAL_HIERARCHY_OCEAN);
    });

    it('handles a hierarchy that has entity relation links', async () => {
      await assertProjectRelationsCorrectlyBuilt('project_storm_test', INITIAL_HIERARCHY_STORM);
    });

    it('handles a hierarchy that has a custom set of canonical types', async () => {
      await buildAndCacheProject('project_wind_test');
      await assertProjectRelationsCorrectlyBuilt('project_wind_test', INITIAL_HIERARCHY_WIND);
    });
  });

  it('deletes all ancestor descendant relations if an entity is deleted', async () => {
    // delete an entity, and make sure its ancestor descendant relations are all deleted
    const entityToDelete = 'entity_aaa_test';
    await models.entityRelation.delete({ child_id: entityToDelete }); // can't delete entity until entity relation is gone
    await models.entity.delete({ id: entityToDelete });
    await assertRelationsMatch('project_storm_test', HIERARCHY_STORM_AFTER_ENTITY_AAA_DELETED);
  });

  it('deletes all ancestor descendant relations if multiple entities are deleted', async () => {
    // delete a few entities, and make sure their relations are deleted
    const entitiesToDelete = [
      'entity_ab_test',
      'entity_aaa_test',
      'entity_aba_test',
      'entity_abb_test',
    ];
    await models.entityRelation.delete({ parent_id: entitiesToDelete });
    await models.entityRelation.delete({ child_id: entitiesToDelete });
    await models.entity.delete({ id: entitiesToDelete });
    await assertRelationsMatch(
      'project_storm_test',
      HIERARCHY_STORM_AFTER_MULTIPLE_ENTITIES_DELETED,
    );
  });

  it('deletes all ancestor descendant relations if an entity relation record is deleted', async () => {
    // delete an entity relation, and make sure the relations in the cache are deleted
    const entityRelationToDelete = {
      parent_id: 'entity_aba_test',
      child_id: 'entity_aaa_test',
      entity_hierarchy_id: 'hierarchy_storm_test',
    };
    await models.entityRelation.delete(entityRelationToDelete);
    await assertRelationsMatch(
      'project_storm_test',
      HIERARCHY_STORM_AFTER_RELATION_ABA_AAA_DELETED,
    );
  });

  it('deletes all ancestor descendant relations if multiple entity relation records are deleted', async () => {
    // delete a few entity relations, and make sure the relations in the cache are deleted
    // strangely enough, after deleting a -> aa, it means the canonical structure takes back over
    const entityRelationsToDelete = [
      {
        parent_id: 'entity_aba_test',
        child_id: 'entity_aaa_test',
        entity_hierarchy_id: 'hierarchy_storm_test',
      },
      {
        parent_id: 'entity_aa_test',
        child_id: 'entity_ab_test',
        entity_hierarchy_id: 'hierarchy_storm_test',
      },
    ];
    await Promise.all(
      entityRelationsToDelete.map(async entityRelation =>
        models.entityRelation.delete(entityRelation),
      ),
    );
    await assertRelationsMatch(
      'project_storm_test',
      HIERARCHY_STORM_AFTER_MULTIPLE_RELATIONS_DELETED,
    );
  });

  it('deletes and rebuilds subtrees across all hierarchies if a parent_id is changed', async () => {
    // update the parent_id of an entity, and make sure the subtree in the database is rebuilt
    await models.entity.updateById('entity_aaa_test', { parent_id: 'entity_a_test' });
    await models.entity.updateById('entity_abb_test', { parent_id: 'entity_aaa_test' });
    await assertRelationsMatch('project_ocean_test', HIERARCHY_OCEAN_AFTER_PARENT_ID_CHANGES);
    await assertRelationsMatch('project_storm_test', HIERARCHY_STORM_AFTER_PARENT_ID_CHANGES);
  });

  it('deletes a subtree when an entity relation record changes hierarchy', async () => {
    // move aba -> aaa to be in the ocean hierarchy
    await models.entityRelation.update(
      {
        parent_id: 'entity_aba_test',
        child_id: 'entity_aaa_test',
        entity_hierarchy_id: 'hierarchy_storm_test',
      },
      { entity_hierarchy_id: 'hierarchy_ocean_test' },
    );
    await assertRelationsMatch(
      'project_storm_test',
      HIERARCHY_STORM_AFTER_RELATION_HIERARCHY_CHANGED,
    );
  });

  describe('deletes a subtree and rebuilds when an entity relation parent_id changes', () => {
    it('handles a change low down in the hierarchy', async () => {
      // change the parent of the aba -> aaa entity to abb
      await models.entityRelation.update(
        {
          parent_id: 'entity_aba_test',
          child_id: 'entity_aaa_test',
          entity_hierarchy_id: 'hierarchy_storm_test',
        },
        { parent_id: 'entity_abb_test' },
      );
      await assertRelationsMatch(
        'project_storm_test',
        HIERARCHY_STORM_AFTER_RELATION_PARENT_ID_CHANGED_1,
      );
    });

    it('handles a change higher up in the hierarchy', async () => {
      // change the parent of the aa -> ab entity to a
      await models.entityRelation.update(
        {
          parent_id: 'entity_aa_test',
          child_id: 'entity_ab_test',
          entity_hierarchy_id: 'hierarchy_storm_test',
        },
        { parent_id: 'entity_a_test' },
      );
      await assertRelationsMatch(
        'project_storm_test',
        HIERARCHY_STORM_AFTER_RELATION_PARENT_ID_CHANGED_2,
      );
    });
  });

  it('deletes and rebuilds a subtree if entity relation records are changed', async () => {
    // change aab to sit below aa instead of abb
    await models.entityRelation.update(
      {
        parent_id: 'entity_abb_test',
        child_id: 'entity_aab_test',
        entity_hierarchy_id: 'hierarchy_storm_test',
      },
      { parent_id: 'entity_aa_test' },
    );
    // change ab to sit below aab instead of aa
    await models.entityRelation.update(
      {
        parent_id: 'entity_aa_test',
        child_id: 'entity_ab_test',
        entity_hierarchy_id: 'hierarchy_storm_test',
      },
      { parent_id: 'entity_aab_test' },
    );
    await assertRelationsMatch(
      'project_storm_test',
      HIERARCHY_STORM_AFTER_MULTIPLE_RELATIONS_CHANGED,
    );
  });

  it('adds a new subtree if entity relation records are added', async () => {
    // change ab to sit below aab instead of aa
    await models.entityRelation.create({
      parent_id: 'entity_ab_test',
      child_id: 'entity_aba_test',
      entity_hierarchy_id: 'hierarchy_storm_test',
    });
    await assertRelationsMatch('project_storm_test', HIERARCHY_STORM_AFTER_ENTITY_RELATION_ADDED);
  });

  it('adds new subtrees if an entities are created', async () => {
    // update the parent_id of an entity, and make sure the subtree in the database is rebuilt
    await upsertDummyRecord(models.entity, { id: 'entity_ac_test', parent_id: 'entity_a_test' });
    await upsertDummyRecord(models.entity, { id: 'entity_aca_test', parent_id: 'entity_ac_test' });
    await upsertDummyRecord(models.entity, { id: 'entity_abc_test', parent_id: 'entity_ab_test' });
    await upsertDummyRecord(models.entity, {
      id: 'entity_aaaa_test',
      parent_id: 'entity_aaa_test',
    });
    await assertRelationsMatch('project_ocean_test', HIERARCHY_OCEAN_AFTER_ENTITIES_CREATED);
    await assertRelationsMatch('project_storm_test', HIERARCHY_STORM_AFTER_ENTITIES_CREATED);
  });

  it('rebuilds a whole tree if custom canonical types are changed', async () => {
    await buildAndCacheProject('project_wind_test');
    await assertRelationsMatch('project_wind_test', INITIAL_HIERARCHY_WIND);
    await models.entityHierarchy.updateById('hierarchy_wind_test', {
      canonical_types: ['project', 'country', 'facility'],
    });
    await assertRelationsMatch('project_wind_test', HIERARCHY_WIND_AFTER_CANONICAL_TYPES_CHANGED);
  });
});
