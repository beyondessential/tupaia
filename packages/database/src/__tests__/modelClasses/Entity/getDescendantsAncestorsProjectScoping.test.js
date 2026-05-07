/**
 * TUP-3065/TUP-3068 regression: Entity.getDescendants / getAncestors must serve
 * project-scoped results for projects whose hierarchies share structural entities
 * (world / project / country). Post-RN-1853 every project has its own copy of
 * sub-country entities (different ids, possibly identical codes); the closure cache
 * for project A must not leak project B's copies.
 *
 * The closure cache (ancestor_descendant_relation) is rebuilt by ClosureCacheBuilder
 * walking entity.parent_id + project_country. This test populates fixtures, runs the
 * builder, then asserts on cache contents via the public getDescendants/getAncestors
 * API.
 */

import {
  getTestModels,
  populateTestData,
  clearTestData,
  upsertDummyRecord,
} from '../../../server/testUtilities';
import { ClosureCacheBuilder } from '../../../server/changeHandlers/entityHierarchyCacher/ClosureCacheBuilder';

describe('Entity.getDescendants / getAncestors — project scoping (TUP-3065/TUP-3068)', () => {
  const models = getTestModels();

  // Shared structural entities (project_id = NULL).
  const WORLD = { id: 'world_tup3065_test', code: 'WORLD_TUP3065', name: 'World', type: 'world' };
  const COUNTRY = {
    id: 'country_tup3065_test',
    code: 'CTRY_TUP3065',
    name: 'Country',
    type: 'country',
    parent_id: 'world_tup3065_test',
  };

  const PROJECT_A_ENTITY = {
    id: 'proj_a_entity_tup3065',
    code: 'PROJ_A_TUP3065',
    name: 'Project A entity',
    type: 'project',
    parent_id: 'world_tup3065_test',
  };
  const PROJECT_B_ENTITY = {
    id: 'proj_b_entity_tup3065',
    code: 'PROJ_B_TUP3065',
    name: 'Project B entity',
    type: 'project',
    parent_id: 'world_tup3065_test',
  };

  const HIERARCHY_A = { id: 'hierarchy_a_tup3065', name: 'hierarchy_a_tup3065' };
  const HIERARCHY_B = { id: 'hierarchy_b_tup3065', name: 'hierarchy_b_tup3065' };

  const PROJECT_A = {
    id: 'proj_a_tup3065',
    code: 'project_a_tup3065',
    entity_id: PROJECT_A_ENTITY.id,
    entity_hierarchy_id: HIERARCHY_A.id,
  };
  const PROJECT_B = {
    id: 'proj_b_tup3065',
    code: 'project_b_tup3065',
    entity_id: PROJECT_B_ENTITY.id,
    entity_hierarchy_id: HIERARCHY_B.id,
  };

  // Sub-country entities (district), one per project, both parented to the shared
  // country. Same code across projects (post-RN-1853 codes are unique per project).
  const DISTRICT_A = {
    id: 'district_a_tup3065',
    code: 'DISTRICT_X_TUP3065',
    name: 'District X (project A)',
    type: 'district',
    parent_id: COUNTRY.id,
    project_id: PROJECT_A.id,
  };
  const DISTRICT_B = {
    id: 'district_b_tup3065',
    code: 'DISTRICT_X_TUP3065',
    name: 'District X (project B)',
    type: 'district',
    parent_id: COUNTRY.id,
    project_id: PROJECT_B.id,
  };

  beforeEach(async () => {
    // Two-pass setup because of the entity.project_id ↔ project.entity_id circular FK:
    // structural entities + projects first, then sub-country entities with project_id.
    await populateTestData(models, {
      entityHierarchy: [HIERARCHY_A, HIERARCHY_B],
      entity: [WORLD, PROJECT_A_ENTITY, PROJECT_B_ENTITY, COUNTRY],
      project: [PROJECT_A, PROJECT_B],
    });
    await upsertDummyRecord(models.entity, DISTRICT_A);
    await upsertDummyRecord(models.entity, DISTRICT_B);
    // TUP-3060: project ↔ country links via project_country (parent_id alone can't
    // express it because country is shared across projects).
    await upsertDummyRecord(models.projectCountry, {
      project_id: PROJECT_A.id,
      country_id: COUNTRY.id,
    });
    await upsertDummyRecord(models.projectCountry, {
      project_id: PROJECT_B.id,
      country_id: COUNTRY.id,
    });

    // Build the closure cache. In production the EntityHierarchyCacher change
    // listener would do this incrementally; in tests we run the builder directly.
    const builder = new ClosureCacheBuilder(models);
    await builder.rebuildForProject(PROJECT_A.id);
    await builder.rebuildForProject(PROJECT_B.id);
  });

  afterEach(async () => {
    await clearTestData(models.database);
  });

  it('descendants of a shared country are scoped to the requested project (A)', async () => {
    const country = await models.entity.findById(COUNTRY.id);
    const descendants = await country.getDescendants(HIERARCHY_A.id);

    const ids = descendants.map(d => d.id);
    expect(ids).toContain(DISTRICT_A.id);
    expect(ids).not.toContain(DISTRICT_B.id);
  });

  it('descendants of a shared country are scoped to the requested project (B)', async () => {
    const country = await models.entity.findById(COUNTRY.id);
    const descendants = await country.getDescendants(HIERARCHY_B.id);

    const ids = descendants.map(d => d.id);
    expect(ids).toContain(DISTRICT_B.id);
    expect(ids).not.toContain(DISTRICT_A.id);
  });

  it('ancestors of a sub-country entity walk up to the country', async () => {
    const districtA = await models.entity.findById(DISTRICT_A.id);
    const ancestors = await districtA.getAncestors(HIERARCHY_A.id);

    const ids = ancestors.map(a => a.id);
    expect(ids).toContain(COUNTRY.id);
    // World is meta — above the project root — and must not surface as an ancestor in
    // a project hierarchy. The world→country and world→project entity.parent_id edges
    // are intentionally filtered from the builder's edges-CTE.
    expect(ids).not.toContain(WORLD.id);
    // Sibling project's district must not leak through, even though their codes match.
    expect(ids).not.toContain(DISTRICT_B.id);
  });

  // TUP-3060: descendant walks from a project entity must bridge through
  // project_country to find that project's countries (country.parent_id points at
  // world, not at the project entity). Same for ancestors of a country.
  it('descendants of a project entity include its countries via project_country', async () => {
    const projectAEntity = await models.entity.findById(PROJECT_A_ENTITY.id);
    const descendants = await projectAEntity.getDescendants(HIERARCHY_A.id);

    const ids = descendants.map(d => d.id);
    expect(ids).toContain(COUNTRY.id);
    expect(ids).toContain(DISTRICT_A.id);
    // sibling project's district must not leak through
    expect(ids).not.toContain(DISTRICT_B.id);
  });

  it('ancestors of a sub-country entity reach the project entity via project_country', async () => {
    const districtA = await models.entity.findById(DISTRICT_A.id);
    const ancestors = await districtA.getAncestors(HIERARCHY_A.id);

    const ids = ancestors.map(a => a.id);
    expect(ids).toContain(PROJECT_A_ENTITY.id);
    // sibling project's project entity must not appear (project_country bridge is
    // scoped to PROJECT_A only)
    expect(ids).not.toContain(PROJECT_B_ENTITY.id);
  });

  it('getDescendants honours generational_distance', async () => {
    const country = await models.entity.findById(COUNTRY.id);
    const directChildren = await country.getDescendants(HIERARCHY_A.id, {
      generational_distance: 1,
    });

    expect(directChildren.map(d => d.id)).toEqual([DISTRICT_A.id]);
  });

  // Regression: every project entity has parent_id = world.id (RN-1853 left this as a
  // breadcrumb to the structural root). If the builder's edges-CTE included that edge,
  // entity-server would emit parent_code = 'World' for the project, which tupaia-web's
  // useNavigationEntities then walks up — triggering a 403 request to
  // /entities/<projectCode>/World. The builder filters out child.type IN
  // ('project', 'country') from the parent_id leg.
  it('the project entity has no ancestors in its own hierarchy', async () => {
    const projectAEntity = await models.entity.findById(PROJECT_A_ENTITY.id);
    const ancestors = await projectAEntity.getAncestors(HIERARCHY_A.id);

    expect(ancestors).toHaveLength(0);
  });

  it('the project entity is not a descendant of world in its hierarchy', async () => {
    const world = await models.entity.findById(WORLD.id);
    const descendants = await world.getDescendants(HIERARCHY_A.id);

    // World is meta — projects are roots, not descendants of world inside any project
    // hierarchy.
    expect(descendants.map(d => d.id)).not.toContain(PROJECT_A_ENTITY.id);
  });

  it('child_code → parent_code map omits the project entity (no World ancestor)', async () => {
    // This is the map that feeds entity-server's parent_code field. If the project
    // entity has an entry here, parent_code on the project surfaces as 'World' in the
    // API response.
    const childToParent = await models.ancestorDescendantRelation.getChildCodeToParentCode(
      HIERARCHY_A.id,
    );

    expect(childToParent[PROJECT_A_ENTITY.code]).toBeUndefined();
    // Sanity: a sub-country code DOES have an entry pointing to its country.
    expect(childToParent[DISTRICT_A.code]).toBe(COUNTRY.code);
  });
});
