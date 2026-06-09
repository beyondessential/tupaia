import { keyBy } from 'es-toolkit/compat';
import { createReducer } from '../utils/createReducer';

// actions
const SET_COUNTRIES = 'SET_COUNTRIES';
const CLEAR_COUNTRIES = 'CLEAR_COUNTRIES';

// action creators
export const setCountries = countries => ({ type: SET_COUNTRIES, countries });

export const clearCountries = () => ({ type: CLEAR_COUNTRIES });

// selectors
export const getCountryCodes = state => Object.keys(state.entities.countries);

export const getCountryName = (state, countryCode) => state.entities.countries[countryCode]?.name;

// reducer
const defaultState = {
  countries: {},
};

const actionHandlers = {
  [SET_COUNTRIES]: action => ({
    ...defaultState,
    countries: keyBy(action.countries, 'code'),
  }),
  [CLEAR_COUNTRIES]: () => ({
    countries: {},
  }),
};

export const entities = createReducer(defaultState, actionHandlers);
