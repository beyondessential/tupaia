import { expect } from 'chai';
import {
  buildAndInsertSurveys,
  findOrCreateDummyCountryEntity,
  generateId,
  generateValueOfType,
  upsertDummyRecord,
} from '@tupaia/database';

import { TEST_USER_EMAIL, TestableApp, upsertEntity, upsertQuestion } from '../../testUtilities';

const PERMISSION_GROUP = 'TEST_POST_CHANGES_PERMISSION_GROUP';
const SUBMIT_SURVEY_RESPONSE = 'SubmitSurveyResponse';

describe('POST /changes', () => {
  const app = new TestableApp();
  const { models } = app;

  const entityId = generateId();
  const surveyId = generateId();
  const questionId = generateId();
  let userId;
  let timezone;

  const generateSurveyResponse = () => ({
    id: generateId(),
    assessor_name: generateValueOfType('text'),
    start_time: generateValueOfType('date'),
    end_time: generateValueOfType('date'),
    timestamp: generateValueOfType('date'),
    entity_id: entityId,
    survey_id: surveyId,
    user_id: userId,
    entities_upserted: [],
    timezone,
    approval_status: 'not_required',
    answers: [
      {
        id: generateId(),
        type: 'FreeText',
        body: generateValueOfType('text'),
        question_id: questionId,
      },
    ],
  });

  const postChanges = body => app.post('changes', { body });

  const expectNotSubmitted = async surveyResponse => {
    const record = await models.surveyResponse.findById(surveyResponse.id);
    expect(record).to.not.exist;
  };

  before(async () => {
    timezone = await models.database.getTimezone();
    await app.grantAccess({ DL: [PERMISSION_GROUP] });

    await findOrCreateDummyCountryEntity(models, { code: 'DL', name: 'Demo Land' });
    const question = await upsertQuestion({ id: questionId, code: 'TEST_POST_CHANGES_QUESTION' });
    const permissionGroup = await upsertDummyRecord(models.permissionGroup, {
      name: PERMISSION_GROUP,
    });
    await buildAndInsertSurveys(models, [
      {
        id: surveyId,
        code: 'TEST_POST_CHANGES_SURVEY',
        permission_group_id: permissionGroup.id,
        questions: [question],
      },
    ]);
    await upsertEntity({ id: entityId, code: 'TEST_POST_CHANGES_ENTITY', country_code: 'DL' });

    const user = await models.user.findOne({ email: TEST_USER_EMAIL });
    userId = user.id;
  });

  after(() => {
    app.revokeAccess();
  });

  describe('Supported change actions', () => {
    it('integrates a SubmitSurveyResponse change', async () => {
      const surveyResponse = generateSurveyResponse();
      const response = await postChanges([
        { action: SUBMIT_SURVEY_RESPONSE, payload: surveyResponse },
      ]);

      expect(response.statusCode).to.equal(200);
      const record = await models.surveyResponse.findById(surveyResponse.id);
      expect(record).to.exist;
    });
  });

  describe('Unsupported change actions', () => {
    const unsupportedActions = [
      'NotAnAction',
      // Properties inherited from Object.prototype
      'constructor',
      'toString',
      'hasOwnProperty',
      '__proto__',
      '__defineGetter__',
    ];

    for (const action of unsupportedActions) {
      it(`returns an error for the action "${action}"`, async () => {
        const surveyResponse = generateSurveyResponse();
        const response = await postChanges([{ action, payload: surveyResponse }]);

        expect(response.statusCode).to.equal(400);
        await expectNotSubmitted(surveyResponse);
      });
    }

    it('returns an error when the action is missing', async () => {
      const surveyResponse = generateSurveyResponse();
      const response = await postChanges([{ payload: surveyResponse }]);

      expect(response.statusCode).to.equal(400);
      await expectNotSubmitted(surveyResponse);
    });

    // If coerced to a string key, `['SubmitSurveyResponse']` would resolve to the handler yet fail
    // the strict equality that selects survey responses for the permissions check, bypassing it
    it('returns an error when the action is an array containing a supported action', async () => {
      const surveyResponse = generateSurveyResponse();
      const response = await postChanges([
        { action: [SUBMIT_SURVEY_RESPONSE], payload: surveyResponse },
      ]);

      expect(response.statusCode).to.equal(400);
      await expectNotSubmitted(surveyResponse);
    });

    it('rejects the whole batch when one change has an unsupported action', async () => {
      const surveyResponse = generateSurveyResponse();
      const response = await postChanges([
        { action: SUBMIT_SURVEY_RESPONSE, payload: surveyResponse },
        { action: 'constructor', payload: {} },
      ]);

      expect(response.statusCode).to.equal(400);
      await expectNotSubmitted(surveyResponse);
    });
  });

  describe('Badly formatted requests', () => {
    it('returns an error when the body is not an array', async () => {
      const response = await postChanges({
        action: SUBMIT_SURVEY_RESPONSE,
        payload: generateSurveyResponse(),
      });
      expect(response.statusCode).to.equal(400);
    });

    it('returns an error when a change is null', async () => {
      const response = await postChanges([null]);
      expect(response.statusCode).to.equal(400);
    });

    it('returns an error when a SubmitSurveyResponse change has no payload', async () => {
      const response = await postChanges([{ action: SUBMIT_SURVEY_RESPONSE }]);
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('Permissions', () => {
    before(async () => {
      // Swap to a policy without access to the survey’s permission group
      app.revokeAccess();
      await app.grantAccess({ DL: ['Public'] });
    });

    after(async () => {
      app.revokeAccess();
      await app.grantAccess({ DL: [PERMISSION_GROUP] });
    });

    it('does not integrate a survey response the user lacks permission to submit', async () => {
      const surveyResponse = generateSurveyResponse();
      const response = await postChanges([
        { action: SUBMIT_SURVEY_RESPONSE, payload: surveyResponse },
      ]);

      expect(response.statusCode).to.equal(403);
      await expectNotSubmitted(surveyResponse);
    });
  });

  describe('Codes matching no record', () => {
    const testCases = [
      { codeField: 'survey_code', idField: 'survey_id' },
      { codeField: 'entity_code', idField: 'entity_id' },
      { codeField: 'user_email', idField: 'user_id' },
    ];

    for (const { codeField, idField } of testCases) {
      it(`returns an error naming the unmatched ${codeField}`, async () => {
        const unmatchedValue = `TEST_POST_CHANGES_UNMATCHED_${codeField}`;
        const surveyResponse = generateSurveyResponse();
        delete surveyResponse[idField];
        surveyResponse[codeField] = unmatchedValue;

        const response = await postChanges([
          { action: SUBMIT_SURVEY_RESPONSE, payload: surveyResponse },
        ]);

        expect(response.statusCode).to.equal(500);
        expect(response.body.error).to.include(unmatchedValue);
        await expectNotSubmitted(surveyResponse);
      });
    }
  });
});
