import { expect } from 'chai';
import { buildAndInsertProjectsAndHierarchies, generateId } from '@tupaia/database';
import { resolveCanonicalEntityForProject } from '../../../apiV2/meditrakApp/utilities/resolveCanonicalEntityForProject';
import { TestableApp, resetTestData } from '../../testUtilities';

const SAMPLE_CODE = 'mc_resolve_test';
const PARENT_CODE = 'mc_resolve_parent';

const insertEntity = async (database, { code = SAMPLE_CODE, name = 'Test', projectId }) => {
  // `id` is provided explicitly because the test schema doesn't have a
  // DEFAULT generate_object_id() on entity.id.
  const id = generateId();
  await database.executeSql(
    `
      INSERT INTO entity (id, code, name, type, country_code, project_id)
      VALUES (?, ?, ?, 'village', 'DL', ?);
    `,
    [id, code, name, projectId],
  );
  return id;
};

describe('resolveCanonicalEntityForProject', () => {
  const app = new TestableApp();
  const { models } = app;
  let projectA;
  let projectB;

  before(async () => {
    await resetTestData();
    const created = await buildAndInsertProjectsAndHierarchies(models, [
      { code: 'mc_resolve_project_a', name: 'mc resolve A', entities: [] },
      { code: 'mc_resolve_project_b', name: 'mc resolve B', entities: [] },
    ]);
    projectA = created[0].project;
    projectB = created[1].project;
  });

  afterEach(async () => {
    // Children (SAMPLE_CODE) first, then any parent rows they reference.
    await models.database.executeSql('DELETE FROM entity WHERE code = ?;', [SAMPLE_CODE]);
    await models.database.executeSql('DELETE FROM entity WHERE code = ?;', [PARENT_CODE]);
  });

  it('returns the existing project-specific row when one exists', async () => {
    const canonicalId = await insertEntity(models.database, { projectId: projectA.id });
    const projectBId = await insertEntity(models.database, {
      projectId: projectB.id,
      name: 'Test B',
    });

    const resolved = await resolveCanonicalEntityForProject(models, {
      canonicalEntityId: canonicalId,
      projectId: projectB.id,
    });

    expect(resolved).to.equal(projectBId);
  });

  it('lazy-duplicates the canonical row when no project-specific row exists', async () => {
    const canonicalId = await insertEntity(models.database, { projectId: projectA.id });

    const resolved = await resolveCanonicalEntityForProject(models, {
      canonicalEntityId: canonicalId,
      projectId: projectB.id,
    });

    expect(resolved).to.not.equal(canonicalId);
    const duplicate = await models.entity.findById(resolved);
    expect(duplicate).to.exist;
    expect(duplicate.code).to.equal(SAMPLE_CODE);
    expect(duplicate.project_id).to.equal(projectB.id);
  });

  it('resolves parent_id into the target project when lazy-duplicating', async () => {
    // Parent exists both as the canonical row (project A) and as a copy in
    // project B. The child exists only in project A, parented to the canonical.
    const parentCanonicalId = await insertEntity(models.database, {
      code: PARENT_CODE,
      projectId: projectA.id,
    });
    const parentBId = await insertEntity(models.database, {
      code: PARENT_CODE,
      name: 'Parent B',
      projectId: projectB.id,
    });
    const childCanonicalId = generateId();
    await models.database.executeSql(
      `
        INSERT INTO entity (id, code, name, type, country_code, project_id, parent_id)
        VALUES (?, ?, 'Child', 'village', 'DL', ?, ?);
      `,
      [childCanonicalId, SAMPLE_CODE, projectA.id, parentCanonicalId],
    );

    const resolved = await resolveCanonicalEntityForProject(models, {
      canonicalEntityId: childCanonicalId,
      projectId: projectB.id,
    });

    const duplicate = await models.entity.findById(resolved);
    expect(duplicate.project_id).to.equal(projectB.id);
    // parent_id points at project B's parent copy, not project A's canonical row.
    expect(duplicate.parent_id).to.equal(parentBId);
  });

  it('throws when the canonical entity id does not exist', async () => {
    let caught;
    try {
      await resolveCanonicalEntityForProject(models, {
        canonicalEntityId: 'mc_does_not_exist',
        projectId: projectA.id,
      });
    } catch (error) {
      caught = error;
    }
    expect(caught?.message).to.match(/No entity found/);
  });

  it('throws when required args are missing', async () => {
    let missingId;
    try {
      await resolveCanonicalEntityForProject(models, { projectId: projectA.id });
    } catch (error) {
      missingId = error;
    }
    expect(missingId?.message).to.match(/canonicalEntityId/);

    let missingProject;
    try {
      await resolveCanonicalEntityForProject(models, { canonicalEntityId: 'whatever' });
    } catch (error) {
      missingProject = error;
    }
    expect(missingProject?.message).to.match(/projectId/);
  });
});
