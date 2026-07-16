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
import { TEST_USER_EMAIL, TestableApp, resetTestData, upsertQuestion } from '../../testUtilities';

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
    // buildAndInsertSurveys returns one wrapper per input survey of shape
    // { survey, surveyScreen, surveyScreenComponents, questions, ... } —
    // unwrap to get the survey record itself.
    const [created] = await buildAndInsertSurveys(models, [
      {
        code: 'meditrak_compat_survey',
        name: 'MediTrak Compat Survey',
        permission_group: 'TEST_PERMISSION_GROUP',
        country_codes: [COUNTRY_CODE],
        project_id: projectB.id,
        questions: [],
      },
    ]);
    survey = created.survey;

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
    expect(response.statusCode).to.equal(200);

    // Because the canonical id didn't already exist, the resolver lazy-
    // duplicates into the survey's project (B). A row should exist in B
    // with the same code.
    const rowInProjectB = await models.entity.findOne({ code, project_id: projectB.id });
    expect(rowInProjectB).to.exist;
    expect(rowInProjectB.name).to.equal('Brand new village');
  });

  it("translates the response's own entity_id from canonical to the project row", async () => {
    // The response references a canonical entity living in project A by its raw
    // (canonical) id; the survey is in project B. The saved response should
    // point at project B's row, not the canonical one.
    const code = `meditrak_respentity_${Date.now()}`;
    const canonicalId = await insertEntity(models.database, { code, projectId: projectA.id });
    const responseId = generateId();

    const surveyResponseObject = {
      id: responseId,
      survey_id: survey.id,
      user_id: userId,
      assessor_name: 'MediTrak Compat Tester',
      start_time: generateValueOfType('date'),
      end_time: generateValueOfType('date'),
      timestamp: generateValueOfType('date'),
      timezone: 'Pacific/Auckland',
      approval_status: 'not_required',
      entity_id: canonicalId,
      entities_upserted: [],
      answers: [],
    };

    const response = await app.post('changes', {
      body: [{ action: 'SubmitSurveyResponse', payload: surveyResponseObject }],
    });
    expect(response.statusCode).to.equal(200);

    const projectBRow = await models.entity.findOne({ code, project_id: projectB.id });
    expect(projectBRow).to.exist;
    const saved = await models.surveyResponse.findById(responseId);
    expect(saved.entity_id).to.not.equal(canonicalId);
    expect(saved.entity_id).to.equal(projectBRow.id);
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
    expect(response.statusCode).to.equal(200);

    // The canonical row in project A keeps its original name.
    const canonicalRow = await models.entity.findById(canonicalId);
    expect(canonicalRow.name).to.equal(`Name ${code}`);

    // A new project-B row exists with the edited name (lazy-duplicated).
    const projectBRow = await models.entity.findOne({ code, project_id: projectB.id });
    expect(projectBRow).to.exist;
    expect(projectBRow.name).to.equal('Edited name from MediTrak');
  });

  it('lazy-duplicates a shared parent only once for two children in one payload', async () => {
    // Two new children in the same payload both reference the same canonical
    // parent that has no project-B copy yet. The cached resolver must coalesce
    // the concurrent lookups so the parent is lazy-duplicated exactly once
    // (no UNIQUE(code, project_id) collision), and both children point at it.
    const parentCode = `meditrak_shared_parent_${Date.now()}`;
    const canonicalParentId = await insertEntity(models.database, {
      code: parentCode,
      projectId: projectA.id,
    });
    const childAId = generateId();
    const childBId = generateId();
    const childCode = `meditrak_child_${Date.now()}`;

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
          id: childAId,
          name: 'Child A',
          code: `${childCode}_a`,
          type: 'village',
          country_code: COUNTRY_CODE,
          parent_id: canonicalParentId,
          attributes: {},
        },
        {
          id: childBId,
          name: 'Child B',
          code: `${childCode}_b`,
          type: 'village',
          country_code: COUNTRY_CODE,
          parent_id: canonicalParentId,
          attributes: {},
        },
      ],
      answers: [],
    };

    const response = await app.post('changes', {
      body: [{ action: 'SubmitSurveyResponse', payload: surveyResponseObject }],
    });
    expect(response.statusCode).to.equal(200);

    // Parent lazy-duplicated into project B exactly once.
    const parentCopies = await models.entity.find({ code: parentCode, project_id: projectB.id });
    expect(parentCopies).to.have.lengthOf(1);
    const childA = await models.entity.findById(childAId);
    const childB = await models.entity.findById(childBId);
    expect(childA.project_id).to.equal(projectB.id);
    expect(childB.project_id).to.equal(projectB.id);
    expect(childA.parent_id).to.equal(parentCopies[0].id);
    expect(childB.parent_id).to.equal(parentCopies[0].id);
  });

  it('translates an Entity-question answer body to the project-specific row', async () => {
    const code = `meditrak_answer_${Date.now()}`;
    // Canonical entity lives in project A; the answer references it by canonical id.
    const canonicalId = await insertEntity(models.database, { code, projectId: projectA.id });
    const question = await upsertQuestion({ type: 'PrimaryEntity' });
    const responseId = generateId();

    const surveyResponseObject = {
      id: responseId,
      survey_id: survey.id,
      user_id: userId,
      assessor_name: 'MediTrak Compat Tester',
      start_time: generateValueOfType('date'),
      end_time: generateValueOfType('date'),
      timestamp: generateValueOfType('date'),
      timezone: 'Pacific/Auckland',
      approval_status: 'not_required',
      entity_id: projectA.entity_id,
      entities_upserted: [],
      answers: [
        { id: generateId(), type: 'PrimaryEntity', question_id: question.id, body: canonicalId },
      ],
    };

    const response = await app.post('changes', {
      body: [{ action: 'SubmitSurveyResponse', payload: surveyResponseObject }],
    });
    expect(response.statusCode).to.equal(200);

    const projectBRow = await models.entity.findOne({ code, project_id: projectB.id });
    expect(projectBRow).to.exist;
    const [savedAnswer] = await models.answer.find({ survey_response_id: responseId });
    expect(savedAnswer.text).to.not.equal(canonicalId);
    expect(savedAnswer.text).to.equal(projectBRow.id);
  });
});
