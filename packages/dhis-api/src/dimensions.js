const DATA_ELEMENT = 'dx';
const ORGANISATION_UNIT = 'ou';
const PERIOD = 'pe';
const PROGRAM = 'program';
const TRACKED_ENTITY_INSTANCE = 'trackedEntityInstance';

export const DHIS2_DIMENSIONS = {
  DATA_ELEMENT,
  ORGANISATION_UNIT,
  PERIOD,
  PROGRAM,
  TRACKED_ENTITY_INSTANCE,
};

export const isDimension = key => Object.values(DHIS2_DIMENSIONS).includes(key);
