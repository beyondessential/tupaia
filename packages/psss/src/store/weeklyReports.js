/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utils/createReducer';

// actions
const OPEN_PANEL = 'OPEN_PANEL';
const CLOSE_PANEL = 'CLOSE_PANEL';
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
    console.log('error', error);
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
    // Todo: pass in active countryWeek as a param
    const { data } = await fakeApi.get(endpoint, { ...fetchOptions, ...queryParameters });
    console.log('data', data);
    dispatch({ type: SITE_WEEKS_LOAD_FINISH, data });
  } catch (error) {
    console.log('error', error);
    dispatch({ type: SITE_WEEKS_LOAD_ERROR, error });
  }

  console.log('done');
};

export const updateWeeklyReportsData = data => async dispatch => {
  console.log('update data...', data);
  dispatch(reloadCountryWeeks({}));
};

export const confirmWeeklyReportsData = () => async (dispatch, getState, { fakeApi }) => {
  console.log('confirm data...');
};

export const openWeeklyReportsPanel = rowId => async dispatch => {
  dispatch({ type: OPEN_PANEL, rowId: rowId });
};

export const closeWeeklyReportsPanel = () => async dispatch => {
  dispatch({ type: CLOSE_PANEL });
};

export const setActiveCountryWeek = rowId => async dispatch => {
  dispatch({ type: SET_ACTIVE_COUNTRY_WEEK, rowId: rowId });
};

// selectors
export const getCountryWeeks = ({ weeklyReports }) => weeklyReports.countryWeeks;
export const getCountryWeeksError = ({ weeklyReports }) => weeklyReports.countryWeeksError;
export const checkCountryWeeksIsLoading = ({ weeklyReports }) =>
  weeklyReports.countryWeeksStatus === 'loading';
export const getSiteWeeks = ({ weeklyReports }) => weeklyReports.siteWeeks;
export const getSiteWeeksError = ({ weeklyReports }) => weeklyReports.countryWeeksError;
export const checkSiteWeeksIsLoading = ({ weeklyReports }) =>
  weeklyReports.siteWeeksStatus === 'loading';

// reducer
const defaultState = {
  panelIsOpen: false,
  activeCountryWeekId: null,
  countryWeeks: [],
  countryWeeksStatus: 'idle',
  countryWeeksError: null,
  siteWeeks: [],
  siteWeeksStatus: 'idle',
  siteWeeksError: null,
};

const actionHandlers = {
  [SET_ACTIVE_COUNTRY_WEEK]: ({ rowId }) => ({
    activeCountryWeekId: rowId,
  }),
  [OPEN_PANEL]: () => ({
    panelIsOpen: true,
  }),
  [CLOSE_PANEL]: () => ({
    panelIsOpen: false,
  }),
  [COUNTRY_WEEKS_LOAD_START]: () => ({
    countryWeeksError: defaultState.countryWeeksError,
    countryWeeksStatus: 'loading',
  }),
  [COUNTRY_WEEKS_LOAD_FINISH]: ({ data }) => ({
    countryWeeksStatus: 'success',
    countryWeeks: data,
  }),
  [COUNTRY_WEEKS_LOAD_ERROR]: ({ error }) => ({
    countryWeeksStatus: 'error',
    countryWeeksError: error.message,
  }),
  [SITE_WEEKS_LOAD_START]: () => ({
    siteWeeksError: defaultState.siteWeeksError,
    siteWeeksStatus: 'loading',
  }),
  [SITE_WEEKS_LOAD_FINISH]: ({ data }) => ({
    siteWeeksStatus: 'success',
    siteWeeks: data,
  }),
  [SITE_WEEKS_LOAD_ERROR]: ({ error }) => ({
    siteWeeksStatus: 'error',
    siteWeeksError: error.message,
  }),
};

export const weeklyReports = createReducer(defaultState, actionHandlers);
