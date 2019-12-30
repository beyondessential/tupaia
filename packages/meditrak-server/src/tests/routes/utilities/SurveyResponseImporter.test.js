/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { flatten } from 'lodash';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import { SurveyResponseImporter } from '../../../routes/utilities';
import * as SurveyResponse from '../../../routes/surveyResponse';

chai.use(chaiAsPromised);
chai.use(sinonChai);

const ENTITY_IDS = {
  '1989': '5d8c4d7963af199371da0560',
  '1993': '5d8c4d7963af199371da0561',
  September: '5d8c4d7963af199371da0562',
  April: '5d8c4d7963af199371da0573',
};
const SURVEY1 = { id: '5d8c4d7963af199371da0570', name: 'Year of birth' };
const SURVEY2 = { id: '5d8c4d7963af199371da0571', name: 'Month of birth' };
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
    { surveyResponseId: '5d8c4d7963af199371da0582', answerIds: ['5d8c4d7963af199371da0583'] },
    { surveyResponseId: '5d8c4d7963af199371da0584', answerIds: ['5d8c4d7963af199371da0585'] },
  ],
  [SURVEY2.id]: [
    { surveyResponseId: '5d8c4d7963af199371da0586', answerIds: ['5d8c4d7963af199371da0587'] },
    { surveyResponseId: '5d8c4d7963af199371da0588', answerIds: ['5d8c4d7963af199371da0589'] },
  ],
};
const ALL_RESULTS = flatten(Object.values(RESULTS_BY_SURVEY_ID));
const TIMESTAMP = 1570000000;
const USER_ID = 'userId';

const transactingModelsStub = {
  transacting: true,
};

const createModelsStub = () => {
  const findOneSurveyStub = sinon.stub();
  findOneSurveyStub
    .withArgs({ name: SURVEY1.name })
    .returns(SURVEY1)
    .withArgs({ name: SURVEY2.name })
    .returns(SURVEY2);

  return {
    survey: {
      findOne: findOneSurveyStub,
    },
    wrapInTransaction: callback => callback(transactingModelsStub),
  };
};

const createResponseExtractors = () => {
  const responseExtractor = row => {
    const { entityId, ...answers } = row;
    return { entityId, answers };
  };

  return { [SHEET1]: responseExtractor, [SHEET2]: responseExtractor };
};

describe('SurveyResponseImporter', () => {
  before(() => {
    sinon.stub(Date, 'now').callsFake(() => TIMESTAMP);
    sinon
      .stub(SurveyResponse, 'submitResponses')
      .callsFake((models, userId, responses) => RESULTS_BY_SURVEY_ID[responses[0].survey_id]);
  });

  describe('import()', () => {
    const modelsStub = createModelsStub();
    const extractors = createResponseExtractors();
    const importer = new SurveyResponseImporter(modelsStub, extractors);

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

  after(() => {
    SurveyResponse.submitResponses.restore();
    Date.now.restore();
  });
});
