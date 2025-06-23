import { DHIS2_RESOURCE_TYPES, DHIS2_DIMENSIONS } from '@tupaia/dhis-api';

export const { ENROLLMENT } = DHIS2_RESOURCE_TYPES;
export const { ORGANISATION_UNIT } = DHIS2_DIMENSIONS;

export const enrollTrackedEntityInProgramIfNotEnrolled = async (
  dhisApi,
  { trackedEntityId, programId, orgUnitId },
) => {
  const isAlreadyEnrolled = await checkIsTrackedEntityEnrolledToProgram(dhisApi, {
    trackedEntityId,
    programId,
    orgUnitId,
  });
  if (isAlreadyEnrolled) {
    return null;
  }

  return enrollTrackedEntityInProgram(dhisApi, { trackedEntityId, programId, orgUnitId });
};

export const enrollTrackedEntityInProgram = async (
  dhisApi,
  { trackedEntityId, programId, orgUnitId },
) => {
  return dhisApi.post(ENROLLMENT, {
    trackedEntityInstance: trackedEntityId,
    program: programId,
    orgUnit: orgUnitId,
  });
};

export const checkIsTrackedEntityEnrolledToProgram = async (
  dhisApi,
  { trackedEntityId, programId, orgUnitId },
) => {
  const enrollments = await getEnrollmentsByTrackedEntityId(dhisApi, {
    trackedEntityId,
    programId,
    orgUnitId,
  });
  const enrolledProgramIds = enrollments.map(({ program }) => program);

  return enrolledProgramIds.includes(programId);
};

export const getEnrollmentsByTrackedEntityId = async (
  dhisApi,
  { trackedEntityId, programId, orgUnitId },
) => {
  return dhisApi.getRecords({
    type: ENROLLMENT,
    filter: {
      [ORGANISATION_UNIT]: orgUnitId,
      trackedEntityInstance: trackedEntityId,
      program: programId,
    },
  });
};
