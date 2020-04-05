/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { combineReducers } from 'redux';
import createCachedSelector from 're-reselect';
import { createSelector } from 'reselect';

import { FETCH_ORG_UNIT, FETCH_ORG_UNIT_SUCCESS, FETCH_ORG_UNIT_ERROR } from '../actions';

function orgUnitMap(state = {}, action) {
  switch (action.type) {
    case FETCH_ORG_UNIT:
      return updateLoading(state, action.organisationUnitCode, true);
    case FETCH_ORG_UNIT_SUCCESS:
      return addOrgUnitToMap(state, action.organisationUnit);
    case FETCH_ORG_UNIT_ERROR:
      return updateLoading(state, action.organisationUnitCode, false);
    default: {
      return state;
    }
  }
}

function orgUnitFetchError(state = '', action) {
  switch (action.type) {
    case FETCH_ORG_UNIT_ERROR:
      return action.errorMessage;
    default:
      return state;
  }
}

export default combineReducers({
  orgUnitMap,
  orgUnitFetchError,
});

// Public Selectors

export const selectOrgUnit = (state, orgUnitCode) => state.orgUnits.orgUnitMap[orgUnitCode];

export const cachedSelectOrgUnitChildren = createCachedSelector(
  [state => state.orgUnits.orgUnitMap, (_, code) => code],
  (orgUnitMapArg, code) => Object.values(orgUnitMapArg).filter(orgUnit => orgUnit.parent === code),
)((state, code) => code);

export const cachedSelectOrgUnitAndDescendants = createCachedSelector(
  [state => state, (_, code) => code],
  (state, code) => {
    const orgUnit = selectOrgUnit(state, code);
    if (!orgUnit) {
      return [];
    }

    const children = cachedSelectOrgUnitChildren(state, code);
    const descendants = children.reduce(
      (array, child) => [
        ...array,
        ...cachedSelectOrgUnitAndDescendants(state, child.organisationUnitCode),
      ],
      [],
    );
    return [orgUnit, ...descendants];
  },
)((state, code) => code);

export const selectOrgUnitsAsHierarchy = createSelector([state => state], state => {
  const root = selectOrgUnit(state, 'World');
  if (!root) {
    return {};
  }

  const selectHierarchyRecursive = (orgUnit, parent) => ({
    ...orgUnit,
    parent,
    organisationUnitChildren: cachedSelectOrgUnitChildren(
      state,
      orgUnit.organisationUnitCode,
    ).map(child => selectHierarchyRecursive(child, orgUnit)),
  });

  const start = Date.now();
  const hierarchy = selectHierarchyRecursive(root);
  const end = Date.now();
  console.log(`Building hierarchy took: ${end - start}ms`);
  return hierarchy;
});

// Data management utility functions

const updateLoading = (state, organisationUnitCode, isLoading) => {
  const existing = state[organisationUnitCode];
  if (!existing) {
    return state;
  }

  if (existing.isComplete) {
    return state;
  }

  return { ...state, [organisationUnitCode]: { ...existing, isLoading } };
};

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

  state[orgUnit.organisationUnitCode] = orgUnit;
  return state;
};

const addOrgUnitToMap = (state, orgUnit) => {
  const start = Date.now();
  let count = 0;
  const { countryHierarchy, parent = {}, organisationUnitChildren: children = [] } = orgUnit;
  let result = { ...state };

  if (countryHierarchy) {
    countryHierarchy.forEach(hierarchyItem => {
      count++;
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
    const end = Date.now();
    console.log(`Insert of ${orgUnit.organisationUnitCode} (${count}) took: ${end - start}ms`);
    return result;
  }

  if (parent.organisationUnitCode) {
    count++;
    result = insertOrgUnit(result, normaliseForMap(parent, undefined, false));
  }

  count++;
  result = insertOrgUnit(result, normaliseForMap(orgUnit, parent.organisationUnitCode, true));

  children.forEach(child => {
    count++;
    result = insertOrgUnit(result, normaliseForMap(child, orgUnit.organisationUnitCode, false));
  });

  const end = Date.now();
  console.log(`Insert of ${orgUnit.organisationUnitCode} (${count}) took: ${end - start}ms`);
  return result;
};
