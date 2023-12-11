/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { flatten } from 'lodash';

import { generateTestId, createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import { SurveyResponseImporter } from '../../../apiV2/utilities';
import * as SurveyResponse from '../../../apiV2/surveyResponse';

const ENTITY_IDS = {
  1989: generateTestId(),
  1993: generateTestId(),
  September: generateTestId(),
  April: generateTestId(),
};
const SURVEY1 = { id: generateTestId(), name: 'Year of birth' };
const SURVEY2 = { id: generateTestId(), name: 'Month of birth' };
const SHEET1 = SURVEY1.name;
const SHEET2 = SURVEY2.name;
const ROWS_BY_SURVEY = {
  [SHEET1]: [
    { entityId: ENTITY_IDS['1989'], year: '1989' },
    { entityId: ENTITY_IDS['1993'], year: '1993' },
  ],
  [SHEET2]: [
    { entityId: ENTITY_IDS.September, month: 'September' },
    { entityId: ENTITY_IDS.April, month: 'April' },
  ],
};
const RESULTS_BY_SURVEY_ID = {
  [SURVEY1.id]: [
    { surveyResponseId: generateTestId(), answerIds: [generateTestId()] },
    { surveyResponseId: generateTestId(), answerIds: [generateTestId()] },
  ],
  [SURVEY2.id]: [
    { surveyResponseId: generateTestId(), answerIds: [generateTestId()] },
    { surveyResponseId: generateTestId(), answerIds: [generateTestId()] },
  ],
};
const ALL_RESULTS = flatten(Object.values(RESULTS_BY_SURVEY_ID));
const TIMESTAMP = 1570000000;
const USER_ID = 'userId';

const createModelsStub = () => {
  return baseCreateModelsStub({
    survey: {
      records: [SURVEY1, SURVEY2],
    },
  });
};

const createResponseExtractors = () => {
  const responseExtractor = row => {
    const { entityId, ...answers } = row;
    return { entityId, answers };
  };

  return { [SHEET1]: responseExtractor, [SHEET2]: responseExtractor };
};

describe('SurveyResponseImporter', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime({ now: TIMESTAMP, toFake: ['Date'] });
    jest
      .spyOn(SurveyResponse, 'submitResponses')
      .mockClear()
      .mockImplementation(
        (models, userId, responses) => RESULTS_BY_SURVEY_ID[responses[0].survey_id],
      );
  });

  afterAll(() => {
    SurveyResponse.submitResponses.mockRestore();
    jest.useRealTimers();
  });

  describe('import()', () => {
    let modelsStub;
    let extractors;
    let importer;

    beforeAll(() => {
      modelsStub = createModelsStub();
      extractors = createResponseExtractors();
      importer = new SurveyResponseImporter(modelsStub, extractors);
    });

    beforeEach(() => {
      SurveyResponse.submitResponses.mockReset();
    });

    it('should use the provided user id for the survey submissions', async () => {
      await importer.import(ROWS_BY_SURVEY, USER_ID);
      expect(SurveyResponse.submitResponses).toHaveBeenCalledWith(expect.anything(), USER_ID);
    });

    it('should use the provided response data as survey responses', async () => {
      await importer.import(ROWS_BY_SURVEY, USER_ID);

      expect(SurveyResponse.submitResponses).toHaveBeenCalledTimes(2);
      expect(SurveyResponse.submitResponses).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        [
          {
            entity_id: ENTITY_IDS['1989'],
            survey_id: SURVEY1.id,
            timestamp: TIMESTAMP,
            answers: { year: '1989' },
          },
          {
            entity_id: ENTITY_IDS['1993'],
            survey_id: SURVEY1.id,
            timestamp: TIMESTAMP,
            answers: { year: '1993' },
          },
        ],
      );
      expect(SurveyResponse.submitResponses).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        [
          {
            entity_id: ENTITY_IDS.September,
            survey_id: SURVEY2.id,
            timestamp: TIMESTAMP,
            answers: { month: 'September' },
          },
          {
            entity_id: ENTITY_IDS.April,
            survey_id: SURVEY2.id,
            timestamp: TIMESTAMP,
            answers: { month: 'April' },
          },
        ],
      );
    });

    it('should return the resulting response ids and answers', () =>
      expect(importer.import(ROWS_BY_SURVEY, USER_ID)).toStrictEqual(ALL_RESULTS));
  });
});
