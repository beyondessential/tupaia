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
      return addOrgUnitToMap(state, action.organisationUnit);
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

export const selectParentOrgUnitCodes = state =>
  Object.values(state.orgUnits.orgUnitMap).map(({ parent }) => parent);

export const cachedSelectOrgUnitChildren = createCachedSelector(
  [state => state.orgUnits.orgUnitMap, (_, code) => code],
  (orgUnitMapArg, code) => Object.values(orgUnitMapArg).filter(orgUnit => orgUnit.parent === code),
)((state, code) => code);

const recursiveBuildDescendantHierarchy = (state, code) => {
  const orgUnit = selectOrgUnit(state, code);
  if (!orgUnit) {
    return [];
  }

  const children = cachedSelectOrgUnitChildren(state, code);

  const descendants = [orgUnit];
  children.forEach(child =>
    descendants.push(...recursiveBuildDescendantHierarchy(state, child.organisationUnitCode)),
  );
  return descendants;
};

export const cachedSelectOrgUnitAndDescendants = createCachedSelector(
  [state => state, (_, code) => code],
  recursiveBuildDescendantHierarchy,
)((state, code) => code);

// Data management utility functions
const normaliseForMap = (
  { organisationUnitChildren, descendant, ...restOfOrgUnit },
  parentOrganisationUnitCode,
  isComplete,
) => ({
  ...restOfOrgUnit,
  parent: parentOrganisationUnitCode,
  isComplete: isComplete,
});

const insertOrgUnit = (state, orgUnit) => {
  const existing = state[orgUnit.organisationUnitCode];
  if (existing && existing.isComplete) {
    return state;
  }

  return { ...state, [orgUnit.organisationUnitCode]: orgUnit };
};

const addOrgUnitToMap = (state, orgUnit) => {
  const { countryHierarchy, parent = {}, organisationUnitChildren: children = [] } = orgUnit;
  let result = { ...state };

  if (countryHierarchy) {
    countryHierarchy.forEach(hierarchyItem => {
      result = insertOrgUnit(
        result,
        normaliseForMap(
          hierarchyItem,
          hierarchyItem.parent,
          hierarchyItem.organisationUnitCode !== 'World',
        ),
      );
    });
    // Country hierarchy includes all relevant data (including requested orgUnit), so once it's been loaded we can exit
    return result;
  }

  if (parent.organisationUnitCode) {
    result = insertOrgUnit(result, normaliseForMap(parent, undefined, false));
  }

  result = insertOrgUnit(result, normaliseForMap(orgUnit, parent.organisationUnitCode, true));

  children.forEach(child => {
    result = insertOrgUnit(result, normaliseForMap(child, orgUnit.organisationUnitCode, false));
  });

  return result;
};
