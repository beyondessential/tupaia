/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { SET_DISASTERS_DATA, SELECT_DISASTER, CHANGE_ORG_UNIT_SUCCESS } from '../actions';

export default function disasters(
  state = {
    disasters: null,
    selectedDisaster: null,
  },
  action,
) {
  switch (action.type) {
    case SET_DISASTERS_DATA:
      return {
        ...state,
        disasters: action.data,
      };
    case SELECT_DISASTER:
      return {
        ...state,
        selectedDisaster: action.disaster,
      };
    case CHANGE_ORG_UNIT_SUCCESS: {
      // De-select disaster when user views a different country.
      const { organisationUnitCode, type } = action.organisationUnit;
      if (!state.selectedDisaster) return state;
      if (type === 'Country' && organisationUnitCode !== state.selectedDisaster.countryCode) {
        return {
          ...state,
          selectedDisaster: null,
        };
      }
    }
    // falls through
    default:
      return state;
  }
}
