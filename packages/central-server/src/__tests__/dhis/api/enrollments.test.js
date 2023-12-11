/**
 * Tupaia MediTrak
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { when } from 'jest-when';

import { createJestMockInstance } from '@tupaia/utils';
import {
  enrollTrackedEntityInProgram,
  enrollTrackedEntityInProgramIfNotEnrolled,
  getEnrollmentsByTrackedEntityId,
  checkIsTrackedEntityEnrolledToProgram,
} from '../../../dhis/api/enrollments';

const ORG_UNIT_ID = 'testOrgUnitId';
const PROGRAM_ID = 'testProgramId';
const TRACKED_ENTITY_ID = 'testTrackedEntityId';

const enrollments = [{ program: PROGRAM_ID }];

const getDhisApi = () => {
  const mockGetRecords = jest.fn().mockResolvedValue([]);
  when(mockGetRecords)
    .defaultResolvedValue([])
    .calledWith(
      expect.objectContaining({
        type: 'enrollments',
        filter: {
          ou: ORG_UNIT_ID,
          trackedEntityInstance: TRACKED_ENTITY_ID,
          program: PROGRAM_ID,
        },
      }),
    )
    .mockResolvedValue(enrollments);

  return createJestMockInstance('@tupaia/dhis-api', 'DhisApi', {
    getRecords: mockGetRecords,
    post: args => args,
  });
};

const assertCorrectInvocationOfEnrollmentCreationApi = (
  api,
  { trackedEntityId, programId, orgUnitId },
) => {
  expect(api.post).toHaveBeenCalledOnceWith('enrollments', {
    trackedEntityInstance: trackedEntityId,
    program: programId,
    orgUnit: orgUnitId,
  });
};

let dhisApi;

describe('enrollments', () => {
  beforeEach(() => {
    dhisApi = getDhisApi();
  });

  describe('enrollTrackedEntityInProgram()', () => {
    it('should invoke the DHIS api for enrolling a tracked entity in a program', async () => {
      const params = {
        trackedEntityId: TRACKED_ENTITY_ID,
        programId: PROGRAM_ID,
        orgUnitId: ORG_UNIT_ID,
      };

      await enrollTrackedEntityInProgram(dhisApi, params);
      assertCorrectInvocationOfEnrollmentCreationApi(dhisApi, params);
    });
  });

  describe('enrollTrackedEntityInProgramIfNotEnrolled()', () => {
    it('should invoke the DHIS api for enrolling a new tracked entity in a program', async () => {
      const params = {
        trackedEntityId: 'newTrackedEntity',
        programId: PROGRAM_ID,
        orgUnitId: ORG_UNIT_ID,
      };

      await enrollTrackedEntityInProgramIfNotEnrolled(dhisApi, params);
      assertCorrectInvocationOfEnrollmentCreationApi(dhisApi, params);
    });

    it('should invoke the DHIS api for enrolling a tracked entity in a new program', async () => {
      const params = {
        trackedEntityId: TRACKED_ENTITY_ID,
        programId: 'newProgram',
        orgUnitId: ORG_UNIT_ID,
      };

      await enrollTrackedEntityInProgramIfNotEnrolled(dhisApi, params);
      assertCorrectInvocationOfEnrollmentCreationApi(dhisApi, params);
    });

    it('should invoke the DHIS api for enrolling a tracked entity in a program for a new organisation unit', async () => {
      const params = {
        trackedEntityId: TRACKED_ENTITY_ID,
        programId: PROGRAM_ID,
        orgUnitId: 'newOrgUnit',
      };

      await enrollTrackedEntityInProgramIfNotEnrolled(dhisApi, params);
      assertCorrectInvocationOfEnrollmentCreationApi(dhisApi, params);
    });

    it('should not attempt to enroll an already enrolled tracked entity', async () => {
      const params = {
        trackedEntityId: TRACKED_ENTITY_ID,
        programId: PROGRAM_ID,
        orgUnitId: ORG_UNIT_ID,
      };

      await enrollTrackedEntityInProgramIfNotEnrolled(dhisApi, params);
      expect(dhisApi.post).toHaveBeenCalledTimes(0);
    });
  });

  describe('checkIsTrackedEntityEnrolledToProgram()', () => {
    it('should return true if the tracked entity is enrolled', async () => {
      const result = await checkIsTrackedEntityEnrolledToProgram(dhisApi, {
        trackedEntityId: TRACKED_ENTITY_ID,
        programId: PROGRAM_ID,
        orgUnitId: ORG_UNIT_ID,
      });
      expect(result).toBe(true);
    });

    it('should return false if the tracked entity is not enrolled', async () => {
      const result = await checkIsTrackedEntityEnrolledToProgram(dhisApi, {
        trackedEntityId: TRACKED_ENTITY_ID,
        programId: 'notEnrolledProgramId',
        orgUnitId: ORG_UNIT_ID,
      });
      expect(result).toBe(false);
    });
  });

  describe('getEnrollmentsByTrackedEntityId()', () => {
    it('return the enrollments for a tracked entity instance', async () => {
      const result = await getEnrollmentsByTrackedEntityId(dhisApi, {
        trackedEntityId: TRACKED_ENTITY_ID,
        programId: PROGRAM_ID,
        orgUnitId: ORG_UNIT_ID,
      });
      expect(result).toStrictEqual(enrollments);
    });
  });
});
