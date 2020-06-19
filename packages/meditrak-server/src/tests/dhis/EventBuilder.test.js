/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import sinon from 'sinon';

import {
  buildAndInsertSurveyResponses,
  buildAndInsertSurveys,
  generateTestId,
} from '@tupaia/database';
import { DhisApi } from '@tupaia/dhis-api';
import * as Enrollments from '../../dhis/api/enrollments';
import { EventBuilder } from '../../dhis/pushers/data/event/EventBuilder';
import { getModels } from '../getModels';
import { upsertEntity } from '../testUtilities';

chai.use(chaiSubset);

const orgUnitId = generateTestId();
const customEventOrgUnitId = generateTestId();
const ENTITIES = {
  ORG_UNIT: {
    id: orgUnitId,
    code: 'ORG_UNIT',
  },
  TRACKED_ENTITY: {
    parent_id: orgUnitId,
    code: 'TRACKED_ENTITY',
    type: 'case',
    metadata: {
      dhis: {
        id: 'trackedEntity_dhisId',
      },
    },
  },
  CUSTOM_EVENT_ORG_UNIT: {
    id: customEventOrgUnitId,
    code: 'CUSTOM_EVENT_ORG_UNIT',
  },
};

const DEFAULT_OU_SURVEY = {
  id: generateTestId(),
  code: 'DEFAULT_OU',
  name: 'Survey using the default org unit for the event',
  questions: [
    {
      id: generateTestId(),
      code: 'DEFAULT_OU1',
      text: 'Select a disease',
    },
  ],
};

const eventOrgUnitQuestionId = generateTestId();
const CUSTOM_OU_SURVEY = {
  id: generateTestId(),
  code: 'CUSTOM_OU',
  name: 'Survey using a custom org unit specified in the response',
  integration_metadata: {
    dhis2: {
      eventOrgUnit: { questionId: eventOrgUnitQuestionId },
    },
  },
  questions: [
    {
      id: eventOrgUnitQuestionId,
      code: 'CUSTOM_OU1',
      text: 'Select the location of the event',
    },
  ],
};

const PROGRAMS = {
  DEFAULT_OU: {
    id: 'DEFAULT_OU_dhisId',
    code: 'DEFAULT_OU',
    programStages: [{ id: 'DEFAULT_OU_STAGE1_dhisId' }],
  },
  CUSTOM_OU: {
    id: 'CUSTOM_OU_dhisId',
    code: 'CUSTOM_OU',
    programStages: [{ id: 'CUSTOM_OU_STAGE1_dhisId' }],
  },
};

const DHIS_RESOURCES = {
  programs: PROGRAMS,
  organisationUnits: {
    ORG_UNIT: {
      ...ENTITIES.ORG_UNIT,
      id: 'ORG_UNIT_dhisId',
    },
    CUSTOM_EVENT_ORG_UNIT: {
      ...ENTITIES.CUSTOM_EVENT_ORG_UNIT,
      id: 'CUSTOM_EVENT_ORG_UNIT_dhisId',
    },
  },
};

const models = getModels();

const createDhisApiStub = () => {
  const getRecordStub = sinon.stub().callsFake(async ({ type, code }) => {
    if (!DHIS_RESOURCES[type]) {
      throw new Error(`DHIS2 resource type is invalid or not stubbed: ${type}`);
    }
    return DHIS_RESOURCES[type][code] || null;
  });

  return sinon.createStubInstance(DhisApi, {
    getRecord: getRecordStub,
    post: params => params,
  });
};

describe('EventBuilder', () => {
  let enrollmentSpy;
  const dhisApi = createDhisApiStub();

  before(async () => {
    enrollmentSpy = sinon.stub(Enrollments, 'enrollTrackedEntityInProgramIfNotEnrolled');
    await buildAndInsertSurveys(models, [DEFAULT_OU_SURVEY, CUSTOM_OU_SURVEY]);
    const entities = Object.values(ENTITIES);
    for (let i = 0; i < entities.length; i++) {
      // Upsert entities in order for correct parent/child relationships
      await upsertEntity(entities[i]);
    }
  });

  beforeEach(() => {
    enrollmentSpy.resetHistory();
  });

  after(() => {
    Enrollments.enrollTrackedEntityInProgramIfNotEnrolled.restore();
  });

  describe('Event building', () => {
    it('should build a program event for a valid survey response', async () => {
      const [{ surveyResponse }] = await buildAndInsertSurveyResponses(models, [
        {
          surveyCode: 'DEFAULT_OU',
          entityCode: 'ORG_UNIT',
          answers: { DEFAULT_OU1: 'Leprosy' },
        },
      ]);

      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event).to.containSubset({
        program: 'DEFAULT_OU',
        orgUnit: 'ORG_UNIT',
        dataValues: [{ code: 'DEFAULT_OU1', value: 'Leprosy' }],
      });
    });

    it('should build a tracker event for a valid survey response against a tracked entity', async () => {
      const [{ surveyResponse }] = await buildAndInsertSurveyResponses(models, [
        {
          surveyCode: 'DEFAULT_OU',
          entityCode: 'TRACKED_ENTITY',
          answers: { DEFAULT_OU1: 'Leprosy' },
        },
      ]);

      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event).to.containSubset({
        trackedEntityInstance: 'trackedEntity_dhisId',
        programStage: 'DEFAULT_OU_STAGE1_dhisId',
      });
      expect(enrollmentSpy).to.have.been.calledOnceWithExactly(sinon.match.instanceOf(DhisApi), {
        trackedEntityId: 'trackedEntity_dhisId',
        programId: 'DEFAULT_OU_dhisId',
        orgUnitId: 'ORG_UNIT_dhisId',
      });
    });

    it('should use a custom organisation unit if the survey is configured accordingly', async () => {
      const [{ surveyResponse }] = await buildAndInsertSurveyResponses(models, [
        {
          surveyCode: 'CUSTOM_OU',
          entityCode: 'TRACKED_ENTITY',
          answers: { CUSTOM_OU1: customEventOrgUnitId },
        },
      ]);

      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event).to.have.property('orgUnit', 'CUSTOM_EVENT_ORG_UNIT');
      // Even when an event is against a different org unit, the tracked entity should still be enrolled in the
      // program within its "home" (i.e. closest parent) org unit
      expect(enrollmentSpy).to.have.been.calledOnceWithExactly(sinon.match.instanceOf(DhisApi), {
        trackedEntityId: 'trackedEntity_dhisId',
        programId: 'CUSTOM_OU_dhisId',
        orgUnitId: 'ORG_UNIT_dhisId',
      });
    });
  });

  describe('Timezone awareness', () => {
    const insertSurveyResponse = async surveyResponseProps => {
      const [{ surveyResponse }] = await buildAndInsertSurveyResponses(models, [
        {
          surveyCode: 'DEFAULT_OU',
          entityCode: 'ORG_UNIT',
          answers: [{ DEFAULT_OU1: 'Leprosy' }],
          ...surveyResponseProps,
        },
      ]);

      return surveyResponse;
    };

    it('Should use correct event time for UTC submissions', async () => {
      const surveyResponse = await insertSurveyResponse({
        submission_time: '2019-07-15T06:25:05Z',
        timezone: 'Etc/UTC',
      });

      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event.eventDate).to.equal('2019-07-15T06:25:05');
    });

    it('Should use correct event time for Tonga based submissions', async () => {
      const surveyResponse = await insertSurveyResponse({
        submission_time: '2019-07-15T06:25:05Z',
        timezone: 'Pacific/Tongatapu', // +13 standard, +14 in daylight saving
      });

      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event.eventDate).to.be.oneOf(['2019-07-15T19:25:05', '2019-07-15T20:25:05']);
    });

    it('Should use correct event time for Tonga based submissions, crossing days', async () => {
      const surveyResponse = await insertSurveyResponse({
        submission_time: '2019-07-15T20:25:05Z',
        timezone: 'Pacific/Tongatapu', // +13 standard, +14 in daylight saving
      });

      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event.eventDate).to.be.oneOf(['2019-07-16T09:25:05', '2019-07-16T10:25:05']);
    });
  });
});
