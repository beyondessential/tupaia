/**
 * Integration tests for the TUP-3067 MediTrak compatibility layer on
 * POST /v1/changes — exercises the canonical-id translation flow with a real
 * survey response payload through the full updateOrCreateSurveyResponse path.
 *
 * Note: the heavier sync-down filtering / canonical-row selection tests are
 * verified via the unit tests in canonicaliseParentIds.test.js and
 * resolveCanonicalEntityForProject.test.js, plus the manual smoke-test
 * against a real meditrak-app build.
 */

import { expect } from 'chai';
import {
  generateId,
  generateValueOfType,
  buildAndInsertProjectsAndHierarchies,
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';
import { TEST_USER_EMAIL, TestableApp, resetTestData } from '../../testUtilities';

const COUNTRY_CODE = 'DL';

const insertEntity = async (database, { code, projectId, parentId = null }) => {
  // `id` is provided explicitly because the test schema doesn't have a
  // DEFAULT generate_object_id() on entity.id.
  const id = generateId();
  await database.executeSql(
    `
      INSERT INTO entity (id, code, name, type, country_code, project_id, parent_id)
      VALUES (?, ?, ?, 'village', ?, ?, ?);
    `,
    [id, code, `Name ${code}`, COUNTRY_CODE, projectId, parentId],
  );
  return id;
};

describe('TUP-3067 MediTrak compat: POST /v1/changes', async () => {
  const app = new TestableApp();
  const { models } = app;

  let projectA;
  let projectB;
  let survey;
  let userId;

  before(async () => {
    await resetTestData();
    await app.grantAccess({ [COUNTRY_CODE]: ['TEST_PERMISSION_GROUP'] });

    await findOrCreateDummyCountryEntity(models, {
      code: COUNTRY_CODE,
      name: 'Demo Land',
    });

    const createdProjects = await buildAndInsertProjectsAndHierarchies(models, [
      { code: 'meditrak_compat_project_a', name: 'MediTrak Compat A', entities: [] },
      { code: 'meditrak_compat_project_b', name: 'MediTrak Compat B', entities: [] },
    ]);
    projectA = createdProjects[0].project;
    projectB = createdProjects[1].project;

    // Survey lives in project B — sync-up edits should land in project B rows.
    const [createdSurvey] = await buildAndInsertSurveys(models, [
      {
        code: 'meditrak_compat_survey',
        name: 'MediTrak Compat Survey',
        permission_group: 'TEST_PERMISSION_GROUP',
        country_codes: [COUNTRY_CODE],
        project_id: projectB.id,
        questions: [],
      },
    ]);
    survey = createdSurvey;

    // Query the user account directly — app.user can be undefined if /auth
    // returned a partial response, which manifests as a 400 from the changes
    // endpoint (user_id fails the hasContent validator).
    const user = await models.user.findOne({ email: TEST_USER_EMAIL });
    userId = user.id;
  });

  after(async () => {
    // Restore the sinon stub *first*. If cleanup later throws, leaking the
    // stub onto the prototype breaks every subsequent test file's
    // grantAccess with "already wrapped".
    app.revokeAccess();
  });

  it('creates a project-specific row for a new entity submitted by MediTrak', async () => {
    const newEntityCanonicalId = generateId();
    const code = `meditrak_new_${Date.now()}`;
    const surveyResponseObject = {
      id: generateId(),
      survey_id: survey.id,
      user_id: userId,
      assessor_name: 'MediTrak Compat Tester',
      start_time: generateValueOfType('date'),
      end_time: generateValueOfType('date'),
      timestamp: generateValueOfType('date'),
      timezone: 'Pacific/Auckland',
      approval_status: 'not_required',
      entity_id: projectA.entity_id,
      entities_upserted: [
        {
          id: newEntityCanonicalId,
          name: 'Brand new village',
          code,
          type: 'village',
          country_code: COUNTRY_CODE,
          // parent_id is required by `constructEntitiesUpsertedValidators` —
          // the [takesIdForm] validator runs on the raw value with no
          // hasContent guard, so a missing field crashes the validator with
          // TypeError → 400 (not the most helpful error message).
          parent_id: projectA.entity_id,
          attributes: {},
        },
      ],
      answers: [],
    };

    const response = await app.post('changes', {
      body: [{ action: 'SubmitSurveyResponse', payload: surveyResponseObject }],
    });
    if (response.statusCode !== 200) {
      // eslint-disable-next-line no-console
      console.error(
        'POST /changes failed:',
        response.statusCode,
        JSON.stringify(response.body, null, 2),
      );
    }
    expect(response.statusCode).to.equal(200);

    // Because the canonical id didn't already exist, the resolver lazy-
    // duplicates into the survey's project (B). A row should exist in B
    // with the same code.
    const rowInProjectB = await models.entity.findOne({ code, project_id: projectB.id });
    expect(rowInProjectB).to.exist;
    expect(rowInProjectB.name).to.equal('Brand new village');
  });

  it('routes an edit of an existing canonical entity into the survey project', async () => {
    const code = `meditrak_existing_${Date.now()}`;
    // Canonical row lives in project A; survey is in project B.
    const canonicalId = await insertEntity(models.database, {
      code,
      projectId: projectA.id,
    });

    const surveyResponseObject = {
      id: generateId(),
      survey_id: survey.id,
      user_id: userId,
      assessor_name: 'MediTrak Compat Tester',
      start_time: generateValueOfType('date'),
      end_time: generateValueOfType('date'),
      timestamp: generateValueOfType('date'),
      timezone: 'Pacific/Auckland',
      approval_status: 'not_required',
      entity_id: projectA.entity_id,
      entities_upserted: [
        {
          id: canonicalId,
          name: 'Edited name from MediTrak',
          code,
          type: 'village',
          country_code: COUNTRY_CODE,
          parent_id: projectA.entity_id,
          attributes: {},
        },
      ],
      answers: [],
    };

    const response = await app.post('changes', {
      body: [{ action: 'SubmitSurveyResponse', payload: surveyResponseObject }],
    });
    if (response.statusCode !== 200) {
      // eslint-disable-next-line no-console
      console.error(
        'POST /changes failed:',
        response.statusCode,
        JSON.stringify(response.body, null, 2),
      );
    }
    expect(response.statusCode).to.equal(200);

    // The canonical row in project A keeps its original name.
    const canonicalRow = await models.entity.findById(canonicalId);
    expect(canonicalRow.name).to.equal(`Name ${code}`);

    // A new project-B row exists with the edited name (lazy-duplicated).
    const projectBRow = await models.entity.findOne({ code, project_id: projectB.id });
    expect(projectBRow).to.exist;
    expect(projectBRow.name).to.equal('Edited name from MediTrak');
  });
});
