/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { SET_DISASTERS_DATA, SELECT_DISASTER, CHANGE_ORG_UNIT } from '../actions';

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
    case CHANGE_ORG_UNIT:
      // De-select disaster when user views a different country.
      const { organisationUnitCode } = action;
      if (!state.selectedDisaster) return state;
      // todo currently the only entities with 2 character codes are countries, and all countries
      // use a two character ISO code, but we should really pull from state and check the actual
      // org unit type
      const isCountry = organisationUnitCode.length === 2;
      if (isCountry && organisationUnitCode !== state.selectedDisaster.countryCode) {
        return {
          ...state,
          selectedDisaster: null,
        };
      }
    default:
      return state;
  }
}
