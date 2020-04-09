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

const selectCountries = createSelector([state => state.orgUnits.orgUnitMap], orgUnitMapArg =>
  Object.entries(orgUnitMapArg)
    .map(([countryCode, countryHierarchy]) => countryHierarchy[countryCode])
    .filter(country => country.organisationUnitCode !== 'World'),
);

const cachedSelectCountryHierarchy = createCachedSelector(
  [state => state.orgUnits.orgUnitMap, (_, code) => code],
  (orgUnitMapArg, code) => {
    if (orgUnitMapArg[code]) {
      // It's a country, or World
      return orgUnitMapArg[code];
    }

    return Object.values(orgUnitMapArg).find(countryHierarchy => countryHierarchy[code]);
  },
)((state, code) => code);

export const selectOrgUnit = (state, code) => {
  const country = cachedSelectCountryHierarchy(state, code);
  if (country === undefined) {
    return undefined;
  }
  return country[code];
};

const selectOrgUnitChildrenFromHierarchy = createCachedSelector(
  [countryHierarchy => countryHierarchy, (_, code) => code],
  (countryHierarchy, code) => {
    return Object.values(countryHierarchy).filter(orgUnit => orgUnit.parent === code);
  },
)((countryHierarchy, code) => code);

export const cachedSelectOrgUnitChildren = (state, code) => {
  const countries = selectCountries(state);
  const countryHierarchy = cachedSelectCountryHierarchy(state, code);
  if (code === 'World') {
    return countries;
  }
  return selectOrgUnitChildrenFromHierarchy(countryHierarchy, code);
};

const recursiveBuildDescendants = (state, code) => {
  const orgUnit = selectOrgUnit(state, code);
  if (!orgUnit) {
    return [];
  }

  const children = cachedSelectOrgUnitChildren(state, code);

  const descendants = [orgUnit];
  children.forEach(child =>
    descendants.push(...recursiveBuildDescendants(state, child.organisationUnitCode)),
  );
  return descendants;
};

export const cachedSelectOrgUnitAndDescendants = createCachedSelector(
  [state => state, (_, code) => code],
  recursiveBuildDescendants,
)((state, code) => code);

const recursiveBuildHierarchy = (state, orgUnit, parent) => ({
  ...orgUnit,
  parent,
  organisationUnitChildren: selectOrgUnitChildrenFromHierarchy(
    state,
    orgUnit.organisationUnitCode,
  ).map(child => recursiveBuildHierarchy(state, child, orgUnit)),
});

const selectCountryAsHierarchy = createCachedSelector(
  [countryHierarchy => countryHierarchy, (_, country) => country, (_, __, world) => world],
  recursiveBuildHierarchy,
)((countryHierarchy, country, world) => country.organisationUnitCode);

export const selectOrgUnitsAsHierarchy = createSelector(
  [state => state.orgUnits.orgUnitMap, selectCountries],
  (orgUnitMapArg, countries) => {
    const world = orgUnitMapArg.World;
    if (!world) {
      return {};
    }

    const hierarchy = {
      ...world,
      organisationUnitChildren: countries.map(country =>
        selectCountryAsHierarchy(orgUnitMapArg[country.organisationUnitCode], country, world),
      ),
    };
    return hierarchy;
  },
);

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
      };
    }
  });

  return result;
};

const buildCountryHierarchy = countryHierarchy => {
  const result = {};
  countryHierarchy.forEach(orgUnit => {
    if (orgUnit.organisationUnitCode !== 'World') {
      result[orgUnit.organisationUnitCode] = normaliseForMap(orgUnit, orgUnit.parent, true);
    }
  });
  return result;
};
