/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { combineReducers } from 'redux';

import { FETCH_ORG_UNIT_SUCCESS, CHANGE_ORG_UNIT_SUCCESS, FETCH_ORG_UNIT } from '../actions';

function orgUnitMap(state = {}, action) {
  switch (action.type) {
    // case FETCH_ORG_UNIT:
    //   return {
    //     ...state,
    //     orgUnitMap: {
    //       ...state.orgUnitMap,
    //       [action.organisationUnit.organisationUnitCode]: { isLoading: true },
    //     },
    //   };
    case CHANGE_ORG_UNIT_SUCCESS:
      return {
        [action.organisationUnit.organisationUnitCode]: action.organisationUnit,
      };
    case FETCH_ORG_UNIT_SUCCESS:
      return {
        ...state,
        [action.organisationUnit.organisationUnitCode]: action.organisationUnit,
      };
    default: {
      return state;
    }
  }
}

export default combineReducers({
  orgUnitMap,
});
