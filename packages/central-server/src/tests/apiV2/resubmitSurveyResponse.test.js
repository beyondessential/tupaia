import { expect } from 'chai';

import { buildAndInsertSurveyResponses, buildAndInsertSurveys, generateId } from '@tupaia/database';
import { EntityTypeEnum, QuestionType } from '@tupaia/types';
import { TestableApp, expectSuccess, upsertEntity } from '../testUtilities';

const ENTITY_ID = generateId();

const questionCode = key => `TEST-${key}`;

let surveyId;

describe('resubmit surveyResponse endpoint', () => {
  const app = new TestableApp();
  const { models } = app;

  before(async () => {
    await app.grantFullAccess();

    await upsertEntity({
      id: ENTITY_ID,
      code: ENTITY_ID,
      type: EntityTypeEnum.facility,
    });

    const [{ survey }] = await buildAndInsertSurveys(models, [
      {
        id: surveyId,
        code: 'TEST_SURVEY_RESP_CRUD',
        questions: [
          { code: questionCode(1), type: QuestionType.FreeText },
          { code: questionCode(2), type: QuestionType.FreeText },
          { code: questionCode(3), type: QuestionType.FreeText },
          { code: questionCode('Autocomplete'), type: QuestionType.Autocomplete },
          { code: questionCode('Binary'), type: QuestionType.Binary },
          { code: questionCode('Date'), type: QuestionType.Date },
          { code: questionCode('FreeText'), type: QuestionType.FreeText },
          { code: questionCode('Geolocate'), type: QuestionType.Geolocate },
          { code: questionCode('Instruction'), type: QuestionType.Instruction },
          { code: questionCode('Number'), type: QuestionType.Number },
          { code: questionCode('Photo'), type: QuestionType.Photo },
          { code: questionCode('Radio'), type: QuestionType.Radio, options: ['RadioA', 'RadioB'] },
          { code: questionCode('SubmissionDate'), type: QuestionType.SubmissionDate },
          { code: questionCode('DateOfData'), type: QuestionType.DateOfData },
        ],
      },
    ]);
    surveyId = survey.id;
  });

  after(() => {
    app.revokeAccess();
  });

  it('Should return a successful response, and outdate the original survey response', async () => {
    const [surveyResponse] = await buildAndInsertSurveyResponses(models, [
      {
        surveyCode: 'TEST_SURVEY_RESP_CRUD',
        entityCode: ENTITY_ID,
        data_time: '2020-01-31T09:00:00',
        answers: { [questionCode(1)]: '123' },
      },
    ]);

    const response = await app.post(
      `surveyResponses/${surveyResponse.surveyResponse.id}/resubmit`,
      {
        body: {
          data_time: '2020-02-02T09:00:00',
          survey_id: surveyId,
          entity_code: ENTITY_ID,
          timezone: 'Pacific/Auckland',
          start_time: '2020-02-02T09:00:00',
          end_time: '2020-02-02T09:10:00',
          answers: {
            [questionCode(1)]: '1236',
          },
        },
      },
    );

    expectSuccess(response);
    const originalResponse = await models.surveyResponse.findById(surveyResponse.surveyResponse.id);
    expect(originalResponse.outdated).to.equal(true);
  });
});
