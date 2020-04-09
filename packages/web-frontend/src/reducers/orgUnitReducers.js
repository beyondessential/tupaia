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

const cachedSelectOrgUnitCountry = createCachedSelector(
  [state => state.orgUnits.orgUnitMap, (_, code) => code],
  (orgUnitMapArg, code) => {
    if (orgUnitMapArg[code]) {
      // It's a country, or World
      return orgUnitMapArg[code];
    }

    Object.values(orgUnitMapArg).forEach(countryHierarchy => {
      if (countryHierarchy[code]) {
        return countryHierarchy;
      }
    });

    return undefined;
  },
)((state, code) => code);

export const selectOrgUnit = createCachedSelector(
  [cachedSelectOrgUnitCountry, (_, code) => code],
  (country, code) => {
    if (country === undefined) {
      return undefined;
    }
    return country[code];
  },
)((state, code) => code);

export const cachedSelectOrgUnitChildren = createCachedSelector(
  [cachedSelectOrgUnitCountry, (_, code) => code],
  (country, code) => Object.values(country).filter(orgUnit => orgUnit.parent === code),
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

const addOrgUnitToMap = (state, orgUnit) => {
  const { countryHierarchy, organisationUnitChildren: countries = [] } = orgUnit;
  let result = state;

  if (countryHierarchy) {
    const country = orgUnit.countryCode;
    if (result[country] && result[country][country].isComplete) {
      return result;
    }

    const world = countryHierarchy.splice(
      countryHierarchy.findIndex(countryOrgUnit => countryOrgUnit.organisationUnitCode === 'World'),
      1,
    )[0];

    if (!result.World) {
      result = { ...result, World: { World: normaliseForMap(world, undefined, false) } };
    }

    return { ...result, [orgUnit.countryCode]: buildCountryHierarchy(countryHierarchy) };
  }

  // Inserting 'World' fetch
  result = { ...result };
  const world = orgUnit;
  result.World = { World: normaliseForMap(world, undefined, true) };

  countries.forEach(country => {
    const countryCode = country.organisationUnitCode;
    if (!result[countryCode] || !result[countryCode][countryCode].isComplete) {
      result[countryCode] = {
        [countryCode]: normaliseForMap(country, world.organisationUnitCode, false),
      };
    }
  });

  return result;
};

const buildCountryHierarchy = countryHierarchy => {
  const start = Date.now();
  const result = {};
  let count = 0;
  countryHierarchy.forEach(orgUnit => {
    count++;
    result[orgUnit.organisationUnitCode] = normaliseForMap(orgUnit, orgUnit.parent, true);
  });
  const end = Date.now();
  console.log(`Insert of country (${count}) took: ${end - start}ms`);
  return result;
};
