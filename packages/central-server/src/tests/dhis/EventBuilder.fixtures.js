import { generateId } from '@tupaia/database';

const orgUnitId = generateId();
const customEventOrgUnitId = generateId();

export const ENTITIES = {
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
        trackedEntityId: 'trackedEntity_dhisId',
      },
    },
  },
  CUSTOM_EVENT_ORG_UNIT: {
    id: customEventOrgUnitId,
    code: 'CUSTOM_EVENT_ORG_UNIT',
  },
};

const eventOrgUnitQuestionId = generateId();

export const SURVEYS = {
  DEFAULT_OU_SURVEY: {
    id: generateId(),
    code: 'DEFAULT_OU',
    name: 'Survey using the default org unit for the event',
    questions: [
      {
        id: generateId(),
        code: 'DEFAULT_OU1',
        text: 'Select a disease',
      },
    ],
  },
  CUSTOM_OU_SURVEY: {
    id: generateId(),
    code: 'CUSTOM_OU',
    name: 'Survey using a custom org unit specified in the response',
    integration_metadata: {
      eventOrgUnit: { questionId: eventOrgUnitQuestionId },
    },
    questions: [
      {
        id: eventOrgUnitQuestionId,
        code: 'CUSTOM_OU1',
        text: 'Select the location of the event',
      },
    ],
  },
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

export const DHIS_RESOURCES = {
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
