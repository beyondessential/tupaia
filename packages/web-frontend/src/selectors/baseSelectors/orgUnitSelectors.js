import { createSelector } from 'reselect';
import { getMeasureFromHierarchy } from '../../utils';
import {
  selectCurrentProjectCode,
  selectCurrentOrgUnitCode,
  selectCurrentOverlayCode,
} from './urlSelectors';

import {
  selectOrgUnitChildrenFromCache,
  selectCountryHeirachy,
  getOrgUnitFromCountry,
} from './cachedSelectors';

export const selectOrgUnit = createSelector(
  [selectCountryHeirachy, (_, code) => code],
  getOrgUnitFromCountry,
);

export const selectOrgUnitCountry = createSelector([selectCountryHeirachy], country =>
  country ? country[country.countryCode] : undefined,
);

// QUESTION: Is this a good pattern?
export const selectCurrentOrgUnit = createSelector(
  [state => selectOrgUnit(state, selectCurrentOrgUnitCode(state))],
  currentOrgUnit => currentOrgUnit || {},
);

export const selectCountriesAsOrgUnits = createSelector(
  [state => state.orgUnits.orgUnitMap],
  orgUnitMap =>
    Object.entries(orgUnitMap)
      .map(([countryCode, countryHierarchy]) =>
        getOrgUnitFromCountry(countryHierarchy, countryCode),
      )
      .filter(country => country && country.type === 'Country'),
);

export const selectOrgUnitChildren = createSelector(
  [
    state => selectCurrentProjectCode(state),
    state => selectCountriesAsOrgUnits(state),
    selectCountryHeirachy,
    (_, code) => code,
  ],
  (projectCode, countriesAsOrgUnits, country, code) =>
    code === projectCode ? countriesAsOrgUnits : selectOrgUnitChildrenFromCache(country, code),
);

const selectOrgUnitSiblingsAndSelf = createSelector(
  [
    state => selectCurrentProjectCode(state),
    (state, code) => getOrgUnitParent(selectOrgUnit(state, code)),
    state => selectCountriesAsOrgUnits(state),
    selectCountryHeirachy,
  ],
  (projectCode, parentCode, countriesAsOrgUnits, country) => {
    if (!parentCode) {
      return [];
    }
    return parentCode === projectCode
      ? countriesAsOrgUnits
      : selectOrgUnitChildrenFromCache(country, parentCode);
  },
);

export const selectOrgUnitSiblings = createSelector(
  [selectOrgUnitSiblingsAndSelf, (_, code) => code],
  (siblings, code) => {
    return siblings.filter(orgUnit => orgUnit.organisationUnitCode !== code);
  },
);
const getOrgUnitParent = orgUnit => (orgUnit ? orgUnit.parent : undefined);
