/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { flatten } from 'lodash';
import sinon from 'sinon';

import { generateId, createModelsStub as baseCreateModelsStub } from '@tupaia/database';
import { SurveyResponseImporter } from '../../../apiV2/utilities';
import * as SurveyResponse from '../../../apiV2/surveyResponse';

const ENTITY_IDS = {
  1989: generateId(),
  1993: generateId(),
  September: generateId(),
  April: generateId(),
};
const SURVEY1 = { id: generateId(), name: 'Year of birth' };
const SURVEY2 = { id: generateId(), name: 'Month of birth' };
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
    { surveyResponseId: generateId(), answerIds: [generateId()] },
    { surveyResponseId: generateId(), answerIds: [generateId()] },
  ],
  [SURVEY2.id]: [
    { surveyResponseId: generateId(), answerIds: [generateId()] },
    { surveyResponseId: generateId(), answerIds: [generateId()] },
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

let clock;

describe('SurveyResponseImporter', () => {
  before(() => {
    clock = sinon.useFakeTimers({ now: TIMESTAMP, toFake: ['Date'] });
    sinon
      .stub(SurveyResponse, 'submitResponses')
      .callsFake((models, userId, responses) => RESULTS_BY_SURVEY_ID[responses[0].survey_id]);
  });

  after(() => {
    SurveyResponse.submitResponses.restore();
    clock.restore();
  });

  describe('import()', () => {
    let modelsStub;
    let extractors;
    let importer;

    before(() => {
      modelsStub = createModelsStub();
      extractors = createResponseExtractors();
      importer = new SurveyResponseImporter(modelsStub, extractors);
    });

    beforeEach(() => {
      SurveyResponse.submitResponses.resetHistory();
    });

    it('should use the provided user id for the survey submissions', async () => {
      await importer.import(ROWS_BY_SURVEY, USER_ID);
      expect(SurveyResponse.submitResponses).to.have.been.calledWith(sinon.match.any, USER_ID);
    });

    it('should use the provided response data as survey responses', async () => {
      await importer.import(ROWS_BY_SURVEY, USER_ID);

      expect(SurveyResponse.submitResponses).to.have.been.calledTwice;
      expect(SurveyResponse.submitResponses).to.have.been.calledWith(
        sinon.match.any,
        sinon.match.any,
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
      expect(SurveyResponse.submitResponses).to.have.been.calledWith(
        sinon.match.any,
        sinon.match.any,
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
      expect(importer.import(ROWS_BY_SURVEY, USER_ID)).to.eventually.have.members(ALL_RESULTS));
  });
});
