/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';
import { DhisApi, DHIS2_RESOURCE_TYPES } from '@tupaia/dhis-api';
import { generateTestId } from '@tupaia/database';

import * as Enrollments from '../../dhis/api/enrollments';
import { EventBuilder } from '../../dhis/pushers/data/event/EventBuilder';
import { insertSurveyAndScreens, insertSurveyResponse, upsertEntity } from '../testUtilities';
import { TestableApp } from '../TestableApp';

const { ENROLLMENT, ORGANISATION_UNIT, PROGRAM } = DHIS2_RESOURCE_TYPES;

const orgUnitId = generateTestId();
const eventOrgUnitQuestionId = generateTestId();
const ENTITIES = {
  orgUnit: {
    id: orgUnitId,
    code: generateTestId(),
    type: 'village',
    dhisId: 'jSk4k1gnSqk',
  },
  trackedEntity: {
    id: generateTestId(),
    code: generateTestId(),
    parent_id: orgUnitId,
    type: 'case',
  },
  eventOrgUnit: {
    id: generateTestId(),
    code: generateTestId(),
    type: 'village',
    dhisId: 'QCJyj3v0Zgr',
  },
};
const EVENT_DATE = '2019-07-15T06:25:05';
const SUBMISSION_TIME = '2019-07-15T06:25:05Z';
const SURVEYS = {
  default: {
    survey: {
      id: generateTestId(),
      code: 'DEFAULT_OU',
      name: 'Survey using the default org unit event',
    },
    question: {
      id: generateTestId(),
      code: 'DEFAULT_OU_01',
      text: 'Select a disease',
    },
    answer: 'Leprosy',
    program: {
      id: 'MYiqpNfhUVu',
      programStages: [{ id: 'Jxa1Ix8Iv0V' }],
    },
  },
  customOrgUnit: {
    survey: {
      id: generateTestId(),
      code: 'CUSTOM_OU',
      name: 'Survey using a custom org unit specified in the response',
      integration_metadata: {
        dhis2: {
          isDataRegional: true,
          eventOrgUnit: { questionId: eventOrgUnitQuestionId },
        },
      },
    },
    question: {
      id: eventOrgUnitQuestionId,
      code: 'CUSTOM_OU_01',
      text: 'Select the location of the event',
    },
    answer: ENTITIES.eventOrgUnit.id,
    program: {
      id: 'yEuywseEAb0',
      programStages: [{ id: 'qRQnJrSuO0h' }],
    },
  },
};
const TRACKED_ENTITY_ID = 'F1GGoKauK4C';
const UTC_TIMEZONE = 'Etc/UTC';

const getDhisApiStub = surveyData => {
  const getRecordStub = sinon.stub();
  getRecordStub
    .returns(null)
    .withArgs(sinon.match({ type: PROGRAM, code: surveyData.survey.code }))
    .returns(surveyData.program)
    .withArgs({ type: ORGANISATION_UNIT, code: ENTITIES.orgUnit.code })
    .returns({ id: ENTITIES.orgUnit.dhisId })
    .withArgs({ type: ORGANISATION_UNIT, code: ENTITIES.eventOrgUnit.code })
    .returns({ id: ENTITIES.eventOrgUnit.dhisId });

  const getRecordsStub = sinon.stub();
  getRecordsStub
    .returns([])
    .withArgs({
      type: ENROLLMENT,
      filter: {
        ou: ENTITIES.orgUnit.dhisId,
        trackedEntityInstance: TRACKED_ENTITY_ID,
      },
    })
    .returns([{ program: surveyData.program.id }]);

  return sinon.createStubInstance(DhisApi, {
    getRecord: getRecordStub,
    getRecords: getRecordsStub,
    post: params => params,
  });
};

const createSurvey = async surveyData => {
  const { survey, question } = surveyData;
  return insertSurveyAndScreens({ survey, screens: [[question]] });
};

const createEntity = async entityData => {
  const { id, code, parent_id: parentId, type } = entityData;
  return upsertEntity({ id, code, parent_id: parentId, type });
};

const createSurveyResponse = async (surveyData, surveyRecord) => {
  const questionCode = surveyData.question.code;
  const { surveyResponse } = await insertSurveyResponse({
    survey: {
      survey_id: surveyData.survey.id,
      entity_id: ENTITIES.orgUnit.id,
      submission_time: SUBMISSION_TIME,
      timezone: UTC_TIMEZONE,
      ...surveyRecord,
    },
    answers: { [questionCode]: surveyData.answer },
  });

  return surveyResponse;
};

describe('EventBuilder', () => {
  const app = new TestableApp();
  const models = app.models;
  const enrollmentSpy = sinon.spy(Enrollments, 'enrollTrackedEntityInProgramIfNotEnrolled');

  before(async () => {
    await createSurvey(SURVEYS.default);
    await createSurvey(SURVEYS.customOrgUnit);

    await createEntity(ENTITIES.orgUnit);
    await createEntity(ENTITIES.eventOrgUnit);
    const trackedEntity = await createEntity(ENTITIES.trackedEntity);
    await trackedEntity.setDhisId(TRACKED_ENTITY_ID);
  });

  beforeEach(() => {
    enrollmentSpy.resetHistory();
  });

  after(() => {
    Enrollments.enrollTrackedEntityInProgramIfNotEnrolled.restore();
  });

  describe('Event building', () => {
    it('should build a program event for a valid survey response', async () => {
      const surveyResponse = await createSurveyResponse(SURVEYS.default, {
        entity_id: ENTITIES.orgUnit.id,
      });
      const dhisApi = getDhisApiStub(SURVEYS.default);

      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event).to.deep.equal({
        program: SURVEYS.default.survey.code,
        orgUnit: ENTITIES.orgUnit.code,
        eventDate: EVENT_DATE,
        dataValues: [{ code: SURVEYS.default.question.code, value: SURVEYS.default.answer }],
      });
    });

    it('should build a tracker event for a valid survey response against a tracked entity', async () => {
      const surveyResponse = await createSurveyResponse(SURVEYS.default, {
        entity_id: ENTITIES.trackedEntity.id,
      });
      const dhisApi = getDhisApiStub(SURVEYS.default);

      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event).to.deep.equal({
        program: SURVEYS.default.survey.code,
        orgUnit: ENTITIES.orgUnit.code,
        eventDate: EVENT_DATE,
        dataValues: [{ code: SURVEYS.default.question.code, value: SURVEYS.default.answer }],
        trackedEntityInstance: TRACKED_ENTITY_ID,
        programStage: SURVEYS.default.program.programStages[0].id,
      });

      expect(enrollmentSpy).to.have.been.calledOnceWithExactly(sinon.match.instanceOf(DhisApi), {
        trackedEntityId: TRACKED_ENTITY_ID,
        programId: SURVEYS.default.program.id,
        orgUnitId: ENTITIES.orgUnit.dhisId,
      });
    });

    it('should use a custom organisation unit if the survey is configured accordingly', async () => {
      const surveyResponse = await createSurveyResponse(SURVEYS.customOrgUnit, {
        entity_id: ENTITIES.trackedEntity.id,
      });
      const dhisApi = getDhisApiStub(SURVEYS.customOrgUnit);

      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event).to.have.property('orgUnit', ENTITIES.eventOrgUnit.code);
      // Even when an event is against a different org unit, the tracked entity should still be enrolled in the
      // program within its "home" (i.e. closest parent) org unit
      expect(enrollmentSpy).to.have.been.calledOnceWithExactly(sinon.match.instanceOf(DhisApi), {
        trackedEntityId: TRACKED_ENTITY_ID,
        programId: SURVEYS.customOrgUnit.program.id,
        orgUnitId: ENTITIES.orgUnit.dhisId,
      });
    });
  });

  describe('Timezone awareness', () => {
    const dhisApi = getDhisApiStub(SURVEYS.default);

    it('Should use correct event time for UTC submissions', async () => {
      const surveyResponse = await createSurveyResponse(SURVEYS.default, {
        submission_time: SUBMISSION_TIME,
        timezone: UTC_TIMEZONE,
      });
      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event.eventDate).to.equal(EVENT_DATE);
    });

    it('Should use correct event time for Tonga based submissions', async () => {
      const timezone = 'Pacific/Tongatapu'; // +13 standard, +14 in daylight saving
      const surveyResponse = await createSurveyResponse(SURVEYS.default, {
        submission_time: SUBMISSION_TIME,
        timezone,
      });
      const expectedEventTimes = ['2019-07-15T19:25:05', '2019-07-15T20:25:05'];
      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event.eventDate).to.be.oneOf(expectedEventTimes);
    });

    it('Should use correct event time for Tonga based submissions, crossing days', async () => {
      const submissionTime = '2019-07-15T20:25:05Z';
      const expectedEventTimes = ['2019-07-16T09:25:05', '2019-07-16T10:25:05'];
      const timezone = 'Pacific/Tongatapu'; // +13 standard, +14 in daylight saving
      const surveyResponse = await createSurveyResponse(SURVEYS.default, {
        submission_time: submissionTime,
        timezone,
      });
      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event.eventDate).to.be.oneOf(expectedEventTimes);
    });
  });
});
