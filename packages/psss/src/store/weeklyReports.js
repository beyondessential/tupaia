/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utils/createReducer';

// actions
const COUNTRY_WEEKS_LOAD_START = 'COUNTRY_WEEKS_LOAD_START';
const COUNTRY_WEEKS_LOAD_FINISH = 'COUNTRY_WEEKS_LOAD_FINISH';
const COUNTRY_WEEKS_LOAD_ERROR = 'COUNTRY_WEEKS_LOAD_ERROR';
const SITES_LOAD_START = 'COUNTRY_WEEK_SITES_LOAD_START';
const SITES_LOAD_FINISH = 'COUNTRY_WEEK_SITES_LOAD_FINISH';
const SITES_LOAD_ERROR = 'COUNTRY_WEEK_SITES_LOAD_ERROR';

// action creators
export const reloadCountryWeeks = ({ fetchOptions, queryParameters }) => async (
  dispatch,
  getState,
  { fakeApi },
) => {
  const endpoint = 'country-weeks';
  dispatch({ type: COUNTRY_WEEKS_LOAD_START });

  try {
    const { data } = await fakeApi.get(endpoint, { ...fetchOptions, ...queryParameters });
    dispatch({ type: COUNTRY_WEEKS_LOAD_FINISH, data });
  } catch (error) {
    dispatch({ type: COUNTRY_WEEKS_LOAD_ERROR, error });
    console.log('error', error);
  }
};

export const reloadCountryWeekSites = ({ fetchOptions, queryParameters }) => async (
  dispatch,
  getState,
  { fakeApi },
) => {
  const endpoint = 'sites';
  dispatch({ type: SITES_LOAD_START });

  try {
    const { data } = await fakeApi.get(endpoint, { ...fetchOptions, ...queryParameters });
    console.log('data', data);
    dispatch({ type: SITES_LOAD_FINISH, data });
  } catch (error) {
    dispatch({ type: SITES_LOAD_ERROR, error });
    console.log('error', error);
  }
};

// selectors
export const getCountryWeeks = ({ weeklyReports }) => weeklyReports.countryWeeks;

// reducer
const defaultState = {
  status: 'idle',
  activeCountryWeekId: '',
  countryWeeks: [],
  countryWeekSites: [],
};

const actionHandlers = {
  [COUNTRY_WEEKS_LOAD_START]: () => ({
    error: defaultState.error,
    status: 'loading',
  }),
  [COUNTRY_WEEKS_LOAD_FINISH]: ({ data }) => ({
    status: 'success',
    countryWeeks: data,
  }),
  [COUNTRY_WEEKS_LOAD_ERROR]: ({ error }) => ({
    status: 'error',
    error,
  }),
  [SITES_LOAD_START]: () => ({
    error: defaultState.error,
    status: 'loading',
  }),
  [SITES_LOAD_FINISH]: ({ data }) => ({
    status: 'success',
    countryWeeks: data,
  }),
  [SITES_LOAD_ERROR]: ({ error }) => ({
    status: 'error',
    error: error.message,
  }),
};

export const weeklyReports = createReducer(defaultState, actionHandlers);
