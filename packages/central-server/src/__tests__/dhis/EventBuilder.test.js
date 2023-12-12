/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  buildAndInsertSurveyResponses,
  buildAndInsertSurveys,
  findOrCreateDummyRecord,
  upsertDummyRecord,
} from '@tupaia/database';
import { createJestMockInstance } from '@tupaia/utils';
import * as Enrollments from '../../dhis/api/enrollments';
import { EventBuilder } from '../../dhis/pushers/data/event/EventBuilder';
import { getModels, upsertEntity } from '../testUtilities';
import { DHIS_RESOURCES, ENTITIES, SURVEYS } from './EventBuilder.fixtures';

const models = getModels();

const createDhisApiStub = () => {
  const getRecordStub = jest.fn(async ({ type, code }) => {
    if (!DHIS_RESOURCES[type]) {
      throw new Error(`DHIS2 resource type is invalid or not stubbed: ${type}`);
    }
    return DHIS_RESOURCES[type][code] || null;
  });

  return createJestMockInstance('@tupaia/dhis-api', 'DhisApi', {
    getRecord: getRecordStub,
    post: params => params,
  });
};

describe('EventBuilder', () => {
  let enrollmentSpy;
  const dhisApi = createDhisApiStub();

  beforeAll(async () => {
    enrollmentSpy = jest
      .spyOn(Enrollments, 'enrollTrackedEntityInProgramIfNotEnrolled')
      .mockImplementation();
    await buildAndInsertSurveys(models, Object.values(SURVEYS));
    const entities = Object.values(ENTITIES);
    const exploreHierarchy = await findOrCreateDummyRecord(models.entityHierarchy, {
      name: 'explore',
    });
    for (let i = 0; i < entities.length; i++) {
      // Upsert entities in order for correct parent/child relationships
      const entity = await upsertEntity(entities[i]);
      if (entity.parent_id) {
        await upsertDummyRecord(models.ancestorDescendantRelation, {
          ancestor_id: entity.parent_id,
          descendant_id: entity.id,
          entity_hierarchy_id: exploreHierarchy.id,
          generational_distance: 1,
        });
      }
    }
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
      expect(event).toMatchObject({
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
      expect(event).toMatchObject({
        trackedEntityInstance: 'trackedEntity_dhisId',
        programStage: 'DEFAULT_OU_STAGE1_dhisId',
      });
      expect(enrollmentSpy).toHaveBeenCalledOnceWith(dhisApi, {
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
          answers: { CUSTOM_OU1: ENTITIES.CUSTOM_EVENT_ORG_UNIT.id },
        },
      ]);

      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event).toHaveProperty('orgUnit', 'CUSTOM_EVENT_ORG_UNIT');
      // Even when an event is against a different org unit, the tracked entity should still be enrolled in the
      // program within its "home" (i.e. closest parent) org unit
      expect(enrollmentSpy).toHaveBeenCalledOnceWith(dhisApi, {
        trackedEntityId: 'trackedEntity_dhisId',
        programId: 'CUSTOM_OU_dhisId',
        orgUnitId: 'ORG_UNIT_dhisId',
      });
    });
  });

  describe('Timezone agnosticism', () => {
    it('Should store data_time without any timezone information', async () => {
      const [{ surveyResponse }] = await buildAndInsertSurveyResponses(models, [
        {
          surveyCode: 'DEFAULT_OU',
          entityCode: 'ORG_UNIT',
          answers: [{ DEFAULT_OU1: 'Leprosy' }],
          data_time: '2019-07-15T06:25:05',
        },
      ]);
      const event = await new EventBuilder(dhisApi, models, surveyResponse).build();
      expect(event.eventDate).toBe('2019-07-15T06:25:05');
    });
  });
});
