/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../../utils/createReducer';

// actions
const COUNTRY_WEEKS_LOAD_START = 'COUNTRY_WEEKS_LOAD_START';
const COUNTRY_WEEKS_LOAD_FINISH = 'COUNTRY_WEEKS_LOAD_FINISH';
const COUNTRY_WEEKS_LOAD_ERROR = 'COUNTRY_WEEKS_LOAD_ERROR';

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

export const updateWeeklyReportsData = () => async dispatch => {
  await dispatch(reloadCountryWeeks({}));
};

export const confirmWeeklyReportsData = () => async () => {
  console.log('confirm data...');
};

// selectors
const STATUSES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};
export const getCountryWeeks = ({ weeklyReports }) => weeklyReports.country.data;
export const getCountryWeeksError = ({ weeklyReports }) => weeklyReports.country.error;
export const checkCountryWeekIsLoading = ({ weeklyReports }) =>
  weeklyReports.country.status === STATUSES.LOADING;

// reducer
const defaultState = {
  data: [],
  status: STATUSES.IDLE,
  error: null,
};

const actionHandlers = {
  [COUNTRY_WEEKS_LOAD_START]: () => ({
    error: defaultState.error,
    status: STATUSES.LOADING,
  }),
  [COUNTRY_WEEKS_LOAD_FINISH]: ({ data }) => ({
    status: STATUSES.SUCCESS,
    data: data,
  }),
  [COUNTRY_WEEKS_LOAD_ERROR]: ({ error }) => ({
    status: STATUSES.ERROR,
    error: error.message,
  }),
};

export const country = createReducer(defaultState, actionHandlers);
