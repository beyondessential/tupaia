/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { createReducer } from '../../utils/createReducer';

// actions
const SITES_FOR_WEEK_LOAD_START = 'SITES_FOR_WEEK_LOAD_START';
const SITES_FOR_WEEK_LOAD_FINISH = 'SITES_FOR_WEEK_LOAD_FINISH';
const SITES_FOR_WEEK_LOAD_ERROR = 'SITES_FOR_WEEK_LOAD_ERROR';

function actionIsValid(state, timestamp) {
  return timestamp === state.weeklyReports.site.fetchStartedAt;
}

// action creators
export const reloadSitesForWeek = ({ fetchOptions, queryParameters }) => async (
  dispatch,
  getState,
  { fakeApi },
) => {
  const endpoint = 'sites';
  const fetchStartedAt = Date.now();
  dispatch({ type: SITES_FOR_WEEK_LOAD_START, fetchStartedAt });

  try {
    const { data } = await fakeApi.get(endpoint, { ...fetchOptions, ...queryParameters });
    if (!actionIsValid(getState(), fetchStartedAt)) {
      return;
    }

    dispatch({ type: SITES_FOR_WEEK_LOAD_FINISH, data });
  } catch (error) {
    if (!actionIsValid(getState(), fetchStartedAt)) {
      return;
    }

    dispatch({ type: SITES_FOR_WEEK_LOAD_ERROR, error });
  }
};

// selectors
const STATUSES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
};
export const getSitesForWeek = ({ weeklyReports }) => weeklyReports.site.data;
export const getSitesForWeekError = ({ weeklyReports }) => weeklyReports.site.error;
export const checkSitesForWeekIsLoading = ({ weeklyReports }) =>
  weeklyReports.site.status === STATUSES.LOADING;

// reducer
const defaultState = {
  data: [],
  status: STATUSES.IDLE,
  error: null,
  fetchStartedAt: null,
};

const actionHandlers = {
  [SITES_FOR_WEEK_LOAD_START]: ({ fetchStartedAt }) => ({
    error: defaultState.error,
    status: STATUSES.LOADING,
    fetchStartedAt,
  }),
  [SITES_FOR_WEEK_LOAD_FINISH]: ({ data }) => ({
    status: STATUSES.SUCCESS,
    data,
  }),
  [SITES_FOR_WEEK_LOAD_ERROR]: ({ error }) => ({
    status: STATUSES.ERROR,
    error: error.message,
  }),
};

export const site = createReducer(defaultState, actionHandlers);
