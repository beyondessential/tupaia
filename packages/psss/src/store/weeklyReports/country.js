/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../../utils/createReducer';

function actionIsValid(state, timestamp) {
  return timestamp === state.weeklyReports.country.fetchStartedAt;
}

// actions
const COUNTRY_WEEKS_LOAD_START = 'COUNTRY_WEEKS_LOAD_START';
const COUNTRY_WEEKS_LOAD_FINISH = 'COUNTRY_WEEKS_LOAD_FINISH';
const COUNTRY_WEEKS_LOAD_ERROR = 'COUNTRY_WEEKS_LOAD_ERROR';

// action creators
export const reloadCountryWeeks = ({ fetchOptions = {}, queryParameters = {} }) => async (
  dispatch,
  getState,
  { fakeApi },
) => {
  const endpoint = 'country-weeks';
  const fetchStartedAt = Date.now();
  dispatch({ type: COUNTRY_WEEKS_LOAD_START, fetchStartedAt });

  try {
    const { data } = await fakeApi.get(endpoint, { ...fetchOptions, ...queryParameters });
    if (!actionIsValid(getState(), fetchStartedAt)) {
      return;
    }
    dispatch({ type: COUNTRY_WEEKS_LOAD_FINISH, data });
  } catch (error) {
    if (!actionIsValid(getState(), fetchStartedAt)) {
      return;
    }
    dispatch({ type: COUNTRY_WEEKS_LOAD_ERROR, error });
  }
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
  fetchStartedAt: null,
};

const actionHandlers = {
  [COUNTRY_WEEKS_LOAD_START]: ({ fetchStartedAt }) => ({
    error: defaultState.error,
    status: STATUSES.LOADING,
    fetchStartedAt,
  }),
  [COUNTRY_WEEKS_LOAD_FINISH]: ({ data }) => ({
    status: STATUSES.SUCCESS,
    data,
  }),
  [COUNTRY_WEEKS_LOAD_ERROR]: ({ error }) => ({
    status: STATUSES.ERROR,
    error: error.message,
  }),
};

export const country = createReducer(defaultState, actionHandlers);
