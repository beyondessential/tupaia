/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { FETCH_ORG_UNIT_SUCCESS } from './actions';

const tooLargeForDevToolsSerializationWarning =
  "This object has been sanitized is too large for redux dev-tools serialization. To de-sanitize, see 'src/sanitizers.js'";

const actionSanitizer = action => {
  return action.type === FETCH_ORG_UNIT_SUCCESS
    ? { ...action, organisationUnit: tooLargeForDevToolsSerializationWarning }
    : action;
};

const stateSanitizer = state => {
  return state.orgUnits
    ? {
        ...state,
        orgUnits: { ...state.orgUnits, orgUnitMap: tooLargeForDevToolsSerializationWarning },
      }
    : state;
};

export const sanitizers = {
  actionSanitizer,
  stateSanitizer,
};
