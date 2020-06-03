/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utils/createReducer';

// actions
const SET_ACTIVE_COUNTRY_WEEK = 'SET_ACTIVE_COUNTRY_WEEK';
const COUNTRY_WEEKS_LOAD_START = 'COUNTRY_WEEKS_LOAD_START';
const COUNTRY_WEEKS_LOAD_FINISH = 'COUNTRY_WEEKS_LOAD_FINISH';
const COUNTRY_WEEKS_LOAD_ERROR = 'COUNTRY_WEEKS_LOAD_ERROR';
const SITE_WEEKS_LOAD_START = 'SITES_WEEKS_LOAD_START';
const SITE_WEEKS_LOAD_FINISH = 'SITES_WEEKS_LOAD_FINISH';
const SITE_WEEKS_LOAD_ERROR = 'SITES_WEEKS_LOAD_ERROR';

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
  }
};

export const reloadSiteWeeks = ({ fetchOptions, queryParameters }) => async (
  dispatch,
  getState,
  { fakeApi },
) => {
  const endpoint = 'sites';
  dispatch({ type: SITE_WEEKS_LOAD_START });

  try {
    const { data } = await fakeApi.get(endpoint, { ...fetchOptions, ...queryParameters });
    dispatch({ type: SITE_WEEKS_LOAD_FINISH, data });
  } catch (error) {
    dispatch({ type: SITE_WEEKS_LOAD_ERROR, error });
  }
};

export const updateWeeklyReportsData = () => async dispatch => {
  await dispatch(reloadCountryWeeks({}));
};

export const confirmWeeklyReportsData = () => async () => {
  console.log('confirm data...');
};

export const setActiveCountryWeek = rowId => async dispatch => {
  dispatch({ type: SET_ACTIVE_COUNTRY_WEEK, rowId: rowId });
};

// selectors
export const getCountryWeeks = ({ weeklyReports }) => weeklyReports.countryWeeks;
export const getCountryWeeksError = ({ weeklyReports }) => weeklyReports.countryWeeksError;
export const getSiteWeeks = ({ weeklyReports }) => weeklyReports.siteWeeks;
export const getSiteWeeksError = ({ weeklyReports }) => weeklyReports.siteWeeksError;

// reducer
const STATUSES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};

const defaultState = {
  activeCountryWeekId: null,
  countryWeeks: [],
  countryWeeksStatus: STATUSES.IDLE,
  countryWeeksError: null,
  siteWeeks: [],
  siteWeeksStatus: STATUSES.IDLE,
  siteWeeksError: null,
};

const actionHandlers = {
  [SET_ACTIVE_COUNTRY_WEEK]: ({ rowId }) => ({
    activeCountryWeekId: rowId,
  }),
  [COUNTRY_WEEKS_LOAD_START]: () => ({
    countryWeeksError: defaultState.countryWeeksError,
    countryWeeksStatus: STATUSES.LOADING,
  }),
  [COUNTRY_WEEKS_LOAD_FINISH]: ({ data }) => ({
    countryWeeksStatus: STATUSES.SUCCESS,
    countryWeeks: data,
  }),
  [COUNTRY_WEEKS_LOAD_ERROR]: ({ error }) => ({
    countryWeeksStatus: STATUSES.ERROR,
    countryWeeksError: error.message,
  }),
  [SITE_WEEKS_LOAD_START]: () => ({
    siteWeeksError: defaultState.siteWeeksError,
    siteWeeksStatus: STATUSES.LOADING,
  }),
  [SITE_WEEKS_LOAD_FINISH]: ({ data }) => ({
    siteWeeksStatus: STATUSES.SUCCESS,
    siteWeeks: data,
  }),
  [SITE_WEEKS_LOAD_ERROR]: ({ error }) => ({
    siteWeeksStatus: STATUSES.ERROR,
    siteWeeksError: error.message,
  }),
};

export const weeklyReports = createReducer(defaultState, actionHandlers);
