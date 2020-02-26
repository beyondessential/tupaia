/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { combineReducers } from 'redux';
import createCachedSelector from 're-reselect';

import { FETCH_ORG_UNIT_SUCCESS } from '../actions';

function orgUnitMap(state = {}, action) {
  switch (action.type) {
    case FETCH_ORG_UNIT_SUCCESS:
      return addOrgUnitToTree(state, action.organisationUnit);
    default: {
      return state;
    }
  }
}

export default combineReducers({
  orgUnitMap,
});

// Public Selectors

export const selectOrgUnit = (state, orgUnitCode) => state.orgUnits.orgUnitMap[orgUnitCode];

export const cachedSelectOrgUnitChildren = createCachedSelector(
  [state => state.orgUnits.orgUnitMap, (_, code) => code],
  (state, code) => Object.values(state).filter(orgUnit => orgUnit.parent === code),
)((state, code) => code);

// Data management utility functions
const normaliseForMap = (orgUnit, parentOrganisationUnitCode, isComplete) => ({
  ...orgUnit,
  parent: parentOrganisationUnitCode,
  organisationUnitChildren: undefined,
  descendants: undefined,
  isComplete: isComplete,
});

const insertOrgUnit = (state, orgUnit) => {
  const existing = state[orgUnit.organisationUnitCode];
  if (existing && existing.isComplete) {
    return state;
  }

  return { ...state, [orgUnit.organisationUnitCode]: orgUnit };
};

const addOrgUnitToTree = (state, orgUnit) => {
  let result = { ...state };
  const parent = orgUnit.parent;
  const children = orgUnit.organisationUnitChildren;
  const descendants = orgUnit.descendants;

  if (parent && parent.organisationUnitCode) {
    result = insertOrgUnit(result, normaliseForMap(parent, undefined, false));
  }
  result = insertOrgUnit(
    result,
    normaliseForMap(orgUnit, parent ? parent.organisationUnitCode || parent : undefined, true),
  );
  if (children) {
    children.forEach(child => {
      result = insertOrgUnit(result, normaliseForMap(child, orgUnit.organisationUnitCode, false));
    });
  }

  if (descendants) {
    descendants.forEach(descendant => {
      result = insertOrgUnit(
        result,
        normaliseForMap(descendant, orgUnit.organisationUnitCode, true),
      );
    });
  }

  return result;
};
