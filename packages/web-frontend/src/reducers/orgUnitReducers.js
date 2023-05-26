/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { combineReducers } from 'redux';

import {
  FETCH_ORG_UNIT,
  FETCH_ORG_UNIT_SUCCESS,
  FETCH_ORG_UNIT_ERROR,
  FETCH_LOGIN_SUCCESS,
  FETCH_LOGOUT_SUCCESS,
  FETCH_LANDING_PAGE_LOGOUT_SUCCESS,
  SET_PROJECT,
} from '../actions';

function orgUnitMap(state = {}, action) {
  switch (action.type) {
    case FETCH_ORG_UNIT:
      return updateLoading(state, action.organisationUnitCode, true);
    case FETCH_ORG_UNIT_SUCCESS:
      return addOrgUnitToMap(state, action.organisationUnit);
    case FETCH_ORG_UNIT_ERROR:
      return updateLoading(state, action.organisationUnitCode, false);
    case FETCH_LOGIN_SUCCESS:
      return {}; // Clear org units on login incase of permission change
    case FETCH_LANDING_PAGE_LOGOUT_SUCCESS:
    case FETCH_LOGOUT_SUCCESS:
      return {}; // Clear org units on logout incase of permission change
    case SET_PROJECT:
      return {}; // Clear org units on project change to fetch alternative hierarchy
    default: {
      return state;
    }
  }
}

function orgUnitFetchError(state = '', action) {
  switch (action.type) {
    case FETCH_ORG_UNIT_SUCCESS:
      return '';
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
  isComplete,
});

const addOrgUnitToMap = (state, orgUnit) => {
  const { countryHierarchy, organisationUnitChildren: countries = [] } = orgUnit;
  let result = state;

  if (countryHierarchy) {
    const country = orgUnit.countryCode;
    if (result[country] && result[country][country].isComplete) {
      return result;
    }

    const project = countryHierarchy.find(hierarchyItem => hierarchyItem.type === 'Project');

    if (!result[project.organisationUnitCode]) {
      result = {
        ...result,
        [project.organisationUnitCode]: {
          [project.organisationUnitCode]: normaliseForMap(project, undefined, false),
        },
      };
    }

    return {
      ...result,
      [orgUnit.countryCode]: buildCountryHierarchy(countryHierarchy, project.organisationUnitCode),
    };
  }

  // Inserting project fetch
  result = { ...result };
  const project = orgUnit;
  result[project.organisationUnitCode] = {
    [project.organisationUnitCode]: normaliseForMap(project, undefined, true),
    countryCode: project.organisationUnitCode,
  };

  countries.forEach(country => {
    const countryCode = country.organisationUnitCode;
    if (!result[countryCode] || !result[countryCode][countryCode].isComplete) {
      result[countryCode] = {
        [countryCode]: normaliseForMap(country, project.organisationUnitCode, false),
        countryCode,
      };
    }
  });

  return result;
};

const buildCountryHierarchy = (countryHierarchy, projectCode) => {
  const result = {};
  countryHierarchy.forEach(orgUnit => {
    if (orgUnit.organisationUnitCode !== projectCode) {
      if (orgUnit.type === 'Country') {
        result.countryCode = orgUnit.organisationUnitCode;
      }
      result[orgUnit.organisationUnitCode] = normaliseForMap(orgUnit, orgUnit.parent, true);
    }
  });
  return result;
};
