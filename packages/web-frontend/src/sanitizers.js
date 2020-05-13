/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { FETCH_ORG_UNIT_SUCCESS, FETCH_MEASURE_DATA_SUCCESS } from './actions';

const tooLargeForDevToolsSerializationWarning =
  "This object has been sanitized is too large for redux dev-tools serialization. To de-sanitize, see 'src/sanitizers.js'";

const actionSanitizer = action => {
  switch (action.type) {
    case FETCH_ORG_UNIT_SUCCESS:
      return { ...action, organisationUnit: tooLargeForDevToolsSerializationWarning };
    case FETCH_MEASURE_DATA_SUCCESS:
      return {
        ...action,
        response: { ...action.response, measureData: tooLargeForDevToolsSerializationWarning },
      };
    default:
      return action;
  }
};

const stateSanitizer = state => {
  return {
    ...state,
    orgUnits: { ...state.orgUnits, orgUnitMap: tooLargeForDevToolsSerializationWarning },
    map: {
      ...state.map,
      measureInfo: {
        ...state.map.measureInfo,
        measureData: tooLargeForDevToolsSerializationWarning,
      },
    },
  };
};

export const sanitizers = {
  actionSanitizer,
  stateSanitizer,
};
