import { expect } from 'chai';
import { resolveCanonicalEntityForProject } from '../../../apiV2/meditrakApp/utilities/resolveCanonicalEntityForProject';
import { TestableApp, resetTestData } from '../../testUtilities';

const SAMPLE_CODE = 'mc_resolve_test';

const insertEntity = async (database, { code = SAMPLE_CODE, name = 'Test', projectId }) => {
  const [{ id }] = await database.executeSql(
    `
      INSERT INTO entity (code, name, type, country_code, project_id)
      VALUES (?, ?, 'village', 'DL', ?)
      RETURNING id;
    `,
    [code, name, projectId],
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
    projectA = await models.project.findOne({});
    if (!projectA) throw new Error('Need at least one project in test data');
    // Create a second project to test cross-project resolution.
    projectB = await models.project.create({
      code: 'mc_test_project_b',
      description: 'Test project B for compat layer',
      sort_order: null,
      image_url: '',
      logo_url: '',
      permission_groups: [],
      default_measure: '',
      dashboard_group_name: 'test',
      entity_id: projectA.entity_id,
    });
  });

  afterEach(async () => {
    await models.database.executeSql('DELETE FROM entity WHERE code = ?;', [SAMPLE_CODE]);
  });

  after(async () => {
    await models.database.executeSql('DELETE FROM project WHERE code = ?;', ['mc_test_project_b']);
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
