/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const DATA_ELEMENT = 'dataElement';
const DATA_GROUP = 'dataGroup';
const SYNC_GROUP = 'syncGroup';
export const DATA_SOURCE_TYPES = {
  DATA_ELEMENT,
  DATA_GROUP,
  SYNC_GROUP,
};

export const EMPTY_ANALYTICS_RESULTS = {
  results: [],
  metadata: {
    dataElementCodeToName: {},
  },
};
