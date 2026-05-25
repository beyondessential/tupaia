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
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';
import { setupDummySyncQueue, TestableApp, upsertQuestion } from '../../testUtilities';

const COUNTRY_CODE = 'DL';
const TEST_PROJECT_CODE = 'meditrak_compat_test';

const insertEntity = async (database, { code, projectId, parentId = null }) => {
  const [{ id }] = await database.executeSql(
    `
      INSERT INTO entity (code, name, type, country_code, project_id, parent_id)
      VALUES (?, ?, 'village', ?, ?, ?)
      RETURNING id;
    `,
    [code, `Name ${code}`, COUNTRY_CODE, projectId, parentId],
  );
  return id;
};

describe('TUP-3067 MediTrak compat: POST /v1/changes', async () => {
  const app = new TestableApp();
  const { models } = app;
  setupDummySyncQueue(models);

  let projectA;
  let projectB;
  let survey;
  let userId;

  before(async () => {
    await app.grantAccess({ [COUNTRY_CODE]: ['TEST_PERMISSION_GROUP'] });

    await findOrCreateDummyCountryEntity(models, {
      code: COUNTRY_CODE,
      name: 'Demo Land',
    });

    projectA = await models.project.findOne({}); // any existing project
    projectB = await models.project.create({
      code: TEST_PROJECT_CODE,
      description: 'compat',
      sort_order: null,
      image_url: '',
      logo_url: '',
      permission_groups: [],
      default_measure: '',
      dashboard_group_name: 'compat',
      entity_id: projectA.entity_id,
    });

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

    userId = (await models.user.findOne({ email: app.user?.email ?? undefined }))?.id;
  });

  after(async () => {
    await models.database.executeSql(`DELETE FROM project WHERE code = ?;`, [TEST_PROJECT_CODE]);
    app.revokeAccess();
  });

  it('creates a project-specific row for a new entity submitted by MediTrak', async () => {
    const newEntityCanonicalId = generateId();
    const code = `meditrak_new_${Date.now()}`;
    const surveyResponseObject = {
      id: generateId(),
      survey_id: survey.id,
      user_id: userId,
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
          attributes: {},
        },
      ],
      answers: [],
    };

    const response = await app.post('changes', {
      body: [{ action: 'SubmitSurveyResponse', payload: surveyResponseObject }],
    });
    expect(response.statusCode).to.equal(200);

    // Because the canonical id didn't already exist, the resolver lazy-
    // duplicates into the survey's project (B). A row should exist in B
    // with the same code.
    const rowInProjectB = await models.entity.findOne({ code, project_id: projectB.id });
    expect(rowInProjectB).to.exist;
    expect(rowInProjectB.name).to.equal('Brand new village');

    await models.database.executeSql(`DELETE FROM entity WHERE code = ?;`, [code]);
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
          attributes: {},
        },
      ],
      answers: [],
    };

    const response = await app.post('changes', {
      body: [{ action: 'SubmitSurveyResponse', payload: surveyResponseObject }],
    });
    expect(response.statusCode).to.equal(200);

    // The canonical row in project A keeps its original name.
    const canonicalRow = await models.entity.findById(canonicalId);
    expect(canonicalRow.name).to.equal(`Name ${code}`);

    // A new project-B row exists with the edited name (lazy-duplicated).
    const projectBRow = await models.entity.findOne({ code, project_id: projectB.id });
    expect(projectBRow).to.exist;
    expect(projectBRow.name).to.equal('Edited name from MediTrak');

    await models.database.executeSql(`DELETE FROM entity WHERE code = ?;`, [code]);
  });
});
