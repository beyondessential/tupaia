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
  INITIAL_HIERARCHY_WIND,
  HIERARCHY_WIND_AFTER_CANONICAL_TYPES_CHANGED,
} from './EntityHierarchyCacher.fixtures';
import { EntityParentChildRelationBuilder } from '../../server/changeHandlers/entityHierarchyCacher/EntityParentChildRelationBuilder';

const TEST_DEBOUNCE_TIME = 50; // short debounce time so tests run more quickly

describe('EntityHierarchyCacher', () => {
  const models = getTestModels();
  const hierarchyCacher = new EntityHierarchyCacher(models);
  const subtreeRebuilder = new EntityHierarchySubtreeRebuilder(models);
  const entityParentChildRelationBuilder = new EntityParentChildRelationBuilder(models);
  hierarchyCacher.setDebounceTime(TEST_DEBOUNCE_TIME); // short debounce time so tests run more quickly

  const buildAndCacheProject = async projectCode => {
    const project = await models.project.findOne({ code: projectCode });
    await subtreeRebuilder.buildAndCacheProject(project);
    await entityParentChildRelationBuilder.rebuildRelationsForProject(project);
  };
  const assertRelationsMatch = async (projectCode, relations) => {
    await models.database.waitForAllChangeHandlers();
    const project = await models.project.findOne({ code: projectCode });
    const { entity_hierarchy_id: hierarchyId } = project;
    const relationsForProject = await models.ancestorDescendantRelation.find({
      entity_hierarchy_id: hierarchyId,
    });
    expect(
      relationsForProject.map(r => ({
        ancestor_id: r.ancestor_id,
        descendant_id: r.descendant_id,
        generational_distance: r.generational_distance,
      })),
    ).toIncludeSameMembers(relations);
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

  it('rebuilds a whole tree if custom canonical types are changed', async () => {
    await buildAndCacheProject('project_wind_test');
    await assertRelationsMatch('project_wind_test', INITIAL_HIERARCHY_WIND);
    await models.entityHierarchy.updateById('hierarchy_wind_test', {
      canonical_types: ['project', 'country', 'facility'],
    });
    await assertRelationsMatch('project_wind_test', HIERARCHY_WIND_AFTER_CANONICAL_TYPES_CHANGED);
  });
});
