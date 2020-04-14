/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { combineReducers } from 'redux';

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

// Data management utility functions

const updateLoading = (state, organisationUnitCode, isLoading) => {
  const existingCountry = state[organisationUnitCode];
  const existing = existingCountry && existingCountry[organisationUnitCode];
  if (!existing) {
    return state;
  }

  if (existing.isComplete) {
    return state;
  }

  return {
    ...state,
    [organisationUnitCode]: {
      ...existingCountry,
      [organisationUnitCode]: { ...existing, isLoading },
    },
  };
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

    const world = countryHierarchy.find(
      hierarchyItem => hierarchyItem.organisationUnitCode === 'World',
    );

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
        countryCode,
      };
    }
  });

  return result;
};

const buildCountryHierarchy = countryHierarchy => {
  const result = {};
  countryHierarchy.forEach(orgUnit => {
    if (orgUnit.organisationUnitCode !== 'World') {
      if (orgUnit.type === 'Country') {
        result.countryCode = orgUnit.organisationUnitCode;
      }
      result[orgUnit.organisationUnitCode] = normaliseForMap(orgUnit, orgUnit.parent, true);
    }
  });
  return result;
};
