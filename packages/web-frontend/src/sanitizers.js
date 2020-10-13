/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { FETCH_ORG_UNIT_SUCCESS, FETCH_MEASURE_DATA_SUCCESS } from './actions';

const actionSanitizer = action => {
  switch (action.type) {
    case FETCH_ORG_UNIT_SUCCESS:
      return getSanitizedActionFetchOrgUnitSuccess(action);
    case FETCH_MEASURE_DATA_SUCCESS:
      return getSanitizedActionFetchMeasureDataSuccess(action);
    default:
      return action;
  }
};

const stateSanitizer = state => ({
  ...state,
  ...getSanitizedStateOrgUnits(state),
  ...getSanitizedStateMap(state),
});

export const sanitizers = {
  actionSanitizer,
  stateSanitizer,
};

// ---------  Sanitizer Utils ---------------

const tooLargeForDevToolsSerializationWarning =
  "This object has been sanitized is too large for redux dev-tools serialization. To de-sanitize, see 'src/sanitizers.js'";
const MAX_MEASURE_DATA_ITEMS = 1000;

// ---------  Action Sanitizers ---------------

const getSanitizedActionFetchOrgUnitSuccess = action => {
  if (!action.organisationUnit || !action.organisationUnit.countryHierarchy) {
    return action;
  }

  return {
    ...action,
    organisationUnit: {
      ...action.organisationUnit,
      countryHierarchy: tooLargeForDevToolsSerializationWarning,
    },
  };
};

const getSanitizedActionFetchMeasureDataSuccess = action => {
  if (!action.response || !action.response.measureData) {
    return action;
  }

  return {
    ...action,
    response: {
      ...action.response,
      measureData:
        action.response.measureData.length < MAX_MEASURE_DATA_ITEMS
          ? action.response.measureData
          : tooLargeForDevToolsSerializationWarning,
    },
  };
};

// --------- State Sanitizers ---------------

const getSanitizedStateOrgUnits = ({ orgUnits }) => {
  if (!orgUnits) {
    return undefined;
  }

  if (!orgUnits.orgUnitMap) {
    return { orgUnits };
  }

  return {
    orgUnits: {
      ...orgUnits,
      orgUnitMap: tooLargeForDevToolsSerializationWarning,
    },
  };
};

const getSanitizedStateMap = ({ map }) => {
  if (!map) {
    return undefined;
  }

  if (!map.measureDataInfo || !map.measureInfo.measureData) {
    return { map };
  }

  return {
    map: {
      ...map,
      measureInfo: {
        ...map.measureInfo,
        measureData:
          map.measureInfo.measureData.length < MAX_MEASURE_DATA_ITEMS
            ? map.measureInfo.measureData
            : tooLargeForDevToolsSerializationWarning,
      },
    },
  };
};
