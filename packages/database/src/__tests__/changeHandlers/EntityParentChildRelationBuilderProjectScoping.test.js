/**
 * RN-1853 regression test for EntityParentChildRelationBuilder.getRelationsViaCanonical.
 *
 * Background: post-RN-1853, sub-country entities are duplicated per project (one row per
 * project that includes them). When the builder walks `entity.parent_id` recursively as
 * the canonical fallback (no entity_relation rows for a level), the result must be scoped
 * to the project being rebuilt — without scoping, walking down from a shared country
 * would return ALL projects' districts at that country.
 *
 * The fix threads `project` through `rebuildRelationsForEntity → fetchAndCacheChildren →
 * getRelationsViaCanonical` and adds `project_id: [project.id, null]` to the entity.find
 * criteria.
 */

import {
  getTestModels,
  populateTestData,
  clearTestData,
  upsertDummyRecord,
} from '../../server/testUtilities';
import { EntityParentChildRelationBuilder } from '../../server/changeHandlers/entityHierarchyCacher/EntityParentChildRelationBuilder';

describe('EntityParentChildRelationBuilder — project scoping (RN-1853)', () => {
  const models = getTestModels();
  const builder = new EntityParentChildRelationBuilder(models);

  // Shared structural entities (project_id = NULL)
  const WORLD = { id: 'world_rn1853_test', code: 'WORLD_RN1853', name: 'World', type: 'world' };
  const COUNTRY = {
    id: 'country_rn1853_test',
    code: 'CTRY_RN1853',
    name: 'Country',
    type: 'country',
    parent_id: 'world_rn1853_test',
  };

  // Two project entities (also structural, project_id = NULL)
  const PROJECT_A_ENTITY = {
    id: 'proj_a_entity_rn1853_test',
    code: 'PROJ_A_RN1853',
    name: 'Project A entity',
    type: 'project',
    parent_id: 'world_rn1853_test',
  };
  const PROJECT_B_ENTITY = {
    id: 'proj_b_entity_rn1853_test',
    code: 'PROJ_B_RN1853',
    name: 'Project B entity',
    type: 'project',
    parent_id: 'world_rn1853_test',
  };

  const HIERARCHY_A = { id: 'hierarchy_a_rn1853_test', name: 'hierarchy_a_rn1853' };
  const HIERARCHY_B = { id: 'hierarchy_b_rn1853_test', name: 'hierarchy_b_rn1853' };

  const PROJECT_A = {
    id: 'proj_a_rn1853_test',
    code: 'project_a_rn1853_test',
    entity_id: PROJECT_A_ENTITY.id,
    entity_hierarchy_id: HIERARCHY_A.id,
  };
  const PROJECT_B = {
    id: 'proj_b_rn1853_test',
    code: 'project_b_rn1853_test',
    entity_id: PROJECT_B_ENTITY.id,
    entity_hierarchy_id: HIERARCHY_B.id,
  };

  // Sub-country entities (district) — one per project, both with parent_id = COUNTRY.
  // Same code 'DISTRICT_X' across projects (post-RN-1853 codes are unique per project).
  const DISTRICT_A = {
    id: 'district_a_rn1853_test',
    code: 'DISTRICT_X_RN1853',
    name: 'District X (project A)',
    type: 'district',
    parent_id: COUNTRY.id,
    project_id: PROJECT_A.id,
  };
  const DISTRICT_B = {
    id: 'district_b_rn1853_test',
    code: 'DISTRICT_X_RN1853',
    name: 'District X (project B)',
    type: 'district',
    parent_id: COUNTRY.id,
    project_id: PROJECT_B.id,
  };

  beforeEach(async () => {
    // Two-pass setup because of the circular FK between entity.project_id ↔ project.entity_id:
    //   1. Insert hierarchies, structural entities (world/project/country — NULL project_id),
    //      and the project rows (which FK to those project entities).
    //   2. Insert sub-country entities with project_id now that projects exist.
    await populateTestData(models, {
      entityHierarchy: [HIERARCHY_A, HIERARCHY_B],
      entity: [WORLD, PROJECT_A_ENTITY, PROJECT_B_ENTITY, COUNTRY],
      project: [PROJECT_A, PROJECT_B],
    });
    await upsertDummyRecord(models.entity, DISTRICT_A);
    await upsertDummyRecord(models.entity, DISTRICT_B);

    // Hook up project entity → country in each hierarchy via entity_relation, so the
    // rebuilder's level-1 walk (entity_relation path) takes it to COUNTRY. The canonical
    // fallback then runs at COUNTRY level, which is the path the RN-1853 fix scopes by
    // project_id and what these tests exercise.
    await upsertDummyRecord(models.entityRelation, {
      parent_id: PROJECT_A_ENTITY.id,
      child_id: COUNTRY.id,
      entity_hierarchy_id: HIERARCHY_A.id,
    });
    await upsertDummyRecord(models.entityRelation, {
      parent_id: PROJECT_B_ENTITY.id,
      child_id: COUNTRY.id,
      entity_hierarchy_id: HIERARCHY_B.id,
    });

    // Also seed entity_parent_child_relation so checkIfEntityIsConnected (which walks
    // that table, not entity_relation) treats the project root as connected.
    await upsertDummyRecord(models.entityParentChildRelation, {
      parent_id: PROJECT_A_ENTITY.id,
      child_id: COUNTRY.id,
      entity_hierarchy_id: HIERARCHY_A.id,
    });
    await upsertDummyRecord(models.entityParentChildRelation, {
      parent_id: PROJECT_B_ENTITY.id,
      child_id: COUNTRY.id,
      entity_hierarchy_id: HIERARCHY_B.id,
    });
  });

  afterEach(async () => {
    await clearTestData(models.database);
  });

  it('only caches the current project\'s sub-country children when walking parent_id', async () => {
    // Wipe any prior child relations under COUNTRY in project A's hierarchy
    await models.entityParentChildRelation.delete({
      parent_id: COUNTRY.id,
      entity_hierarchy_id: HIERARCHY_A.id,
    });

    // Rebuild project A from its root. The canonical-fallback path will walk
    // entity.parent_id from COUNTRY and (without the fix) return BOTH district rows.
    await builder.rebuildRelationsForProject(PROJECT_A);

    const cachedChildrenOfCountry = await models.entityParentChildRelation.find({
      parent_id: COUNTRY.id,
      entity_hierarchy_id: HIERARCHY_A.id,
    });

    expect(cachedChildrenOfCountry).toHaveLength(1);
    expect(cachedChildrenOfCountry[0].child_id).toBe(DISTRICT_A.id);
  });

  it('does not leak project B\'s entities into project A\'s cache', async () => {
    await builder.rebuildRelationsForProject(PROJECT_A);

    const projectACache = await models.entityParentChildRelation.find({
      entity_hierarchy_id: HIERARCHY_A.id,
    });

    expect(projectACache.map(r => r.child_id)).not.toContain(DISTRICT_B.id);
    expect(projectACache.map(r => r.child_id)).toContain(DISTRICT_A.id);
  });

  it('caches project B\'s sub-country children correctly when rebuilt from project B\'s root', async () => {
    await builder.rebuildRelationsForProject(PROJECT_B);

    const cachedChildrenOfCountry = await models.entityParentChildRelation.find({
      parent_id: COUNTRY.id,
      entity_hierarchy_id: HIERARCHY_B.id,
    });

    expect(cachedChildrenOfCountry).toHaveLength(1);
    expect(cachedChildrenOfCountry[0].child_id).toBe(DISTRICT_B.id);
  });
});
