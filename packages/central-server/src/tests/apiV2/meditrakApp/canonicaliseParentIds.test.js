import { expect } from 'chai';
import { RECORDS, buildAndInsertProjectsAndHierarchies, generateId } from '@tupaia/database';
import { canonicaliseEntityParentIds } from '../../../apiV2/meditrakApp/meditrakSync/canonicaliseParentIds';
import { TestableApp, resetTestData } from '../../testUtilities';

const CHILD_CODE = 'mc_canon_child';
const PARENT_CODE = 'mc_canon_parent';

const insertEntity = async (database, { code, projectId, parentId = null }) => {
  // `id` is provided explicitly because the test schema doesn't have a
  // DEFAULT generate_object_id() on entity.id. We rely on `generateId()`'s
  // timestamp-ordered output so the canonical (MIN(id)) row is the first
  // one inserted — same invariant the production migration sets up.
  const id = generateId();
  await database.executeSql(
    `
      INSERT INTO entity (id, code, name, type, country_code, project_id, parent_id)
      VALUES (?, ?, ?, 'village', 'DL', ?, ?);
    `,
    [id, code, `Name for ${code}`, projectId, parentId],
  );
  return id;
};

describe('canonicaliseEntityParentIds', () => {
  const app = new TestableApp();
  const { models } = app;
  let projectA;
  let projectB;

  before(async () => {
    await resetTestData();
    const created = await buildAndInsertProjectsAndHierarchies(models, [
      { code: 'mc_canon_project_a', name: 'mc canon A', entities: [] },
      { code: 'mc_canon_project_b', name: 'mc canon B', entities: [] },
    ]);
    projectA = created[0].project;
    projectB = created[1].project;
  });

  afterEach(async () => {
    await models.database.executeSql(`DELETE FROM entity WHERE code IN (?, ?);`, [
      CHILD_CODE,
      PARENT_CODE,
    ]);
  });

  it('rewrites parent_id from project-specific to canonical', async () => {
    // Canonical parent (lower id) in project A
    const canonicalParentId = await insertEntity(models.database, {
      code: PARENT_CODE,
      projectId: projectA.id,
    });
    // Non-canonical parent (higher id) in project B
    const nonCanonicalParentId = await insertEntity(models.database, {
      code: PARENT_CODE,
      projectId: projectB.id,
    });
    // Child whose parent_id points at the non-canonical parent
    const childId = await insertEntity(models.database, {
      code: CHILD_CODE,
      projectId: projectB.id,
      parentId: nonCanonicalParentId,
    });

    const changesToSend = [
      {
        recordType: RECORDS.ENTITY,
        record: { id: childId, code: CHILD_CODE, parent_id: nonCanonicalParentId },
      },
    ];

    await canonicaliseEntityParentIds(models, changesToSend);

    expect(changesToSend[0].record.parent_id).to.equal(canonicalParentId);
  });

  it('leaves parent_id unchanged when it already points at the canonical row', async () => {
    const canonicalParentId = await insertEntity(models.database, {
      code: PARENT_CODE,
      projectId: projectA.id,
    });
    const childId = await insertEntity(models.database, {
      code: CHILD_CODE,
      projectId: projectA.id,
      parentId: canonicalParentId,
    });

    const changesToSend = [
      {
        recordType: RECORDS.ENTITY,
        record: { id: childId, code: CHILD_CODE, parent_id: canonicalParentId },
      },
    ];

    await canonicaliseEntityParentIds(models, changesToSend);

    expect(changesToSend[0].record.parent_id).to.equal(canonicalParentId);
  });

  it('skips records that are not entities', async () => {
    const changesToSend = [
      {
        recordType: 'survey',
        record: { id: 'mc_survey_id', parent_id: 'mc_some_id' },
      },
    ];

    await canonicaliseEntityParentIds(models, changesToSend);

    // parent_id untouched because non-entity records pass through unchanged.
    expect(changesToSend[0].record.parent_id).to.equal('mc_some_id');
  });

  it('is a no-op when no entity records have a parent_id', async () => {
    const changesToSend = [
      { recordType: RECORDS.ENTITY, record: { id: 'mc_no_parent', code: 'mc_no_parent' } },
    ];

    await canonicaliseEntityParentIds(models, changesToSend);

    expect(changesToSend[0].record.parent_id).to.equal(undefined);
  });
});
