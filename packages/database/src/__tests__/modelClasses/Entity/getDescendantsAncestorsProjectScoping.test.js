/**
 * TUP-3065 regression: Entity.getDescendants / getAncestors must walk entity.parent_id
 * directly and stay scoped to the requested project. Post-RN-1853 every project has
 * its own copy of sub-country entities (different ids, possibly identical codes); a
 * descendant walk from a shared structural root (world / project / country) must not
 * leak duplicates from sibling projects.
 */

import {
  getTestModels,
  populateTestData,
  clearTestData,
  upsertDummyRecord,
} from '../../../server/testUtilities';

describe('Entity.getDescendants / getAncestors — project scoping (TUP-3065)', () => {
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

  it('ancestors of a sub-country entity walk the parent_id chain to the structural roof', async () => {
    const districtA = await models.entity.findById(DISTRICT_A.id);
    const ancestors = await districtA.getAncestors(HIERARCHY_A.id);

    const ids = ancestors.map(a => a.id);
    expect(ids).toEqual(expect.arrayContaining([COUNTRY.id, WORLD.id]));
    // Ancestors must not include the sibling project's district even though their
    // codes match — different ids.
    expect(ids).not.toContain(DISTRICT_B.id);
  });

  it('getDescendants honours generational_distance', async () => {
    const country = await models.entity.findById(COUNTRY.id);
    const directChildren = await country.getDescendants(HIERARCHY_A.id, {
      generational_distance: 1,
    });

    expect(directChildren.map(d => d.id)).toEqual([DISTRICT_A.id]);
  });
});
