/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { createReducer } from '../../utils/createReducer';

// actions
const SITES_FOR_WEEK_LOAD_START = 'SITES_WEEKS_LOAD_START';
const SITES_FOR_WEEK_LOAD_FINISH = 'SITES_WEEKS_LOAD_FINISH';
const SITES_FOR_WEEK_LOAD_ERROR = 'SITES_WEEKS_LOAD_ERROR';

// action creators
export const reloadSitesForWeek = ({ fetchOptions, queryParameters }) => async (
  dispatch,
  getState,
  { fakeApi },
) => {
  const endpoint = 'sites';
  dispatch({ type: SITES_FOR_WEEK_LOAD_START });

  try {
    const { data } = await fakeApi.get(endpoint, { ...fetchOptions, ...queryParameters });
    dispatch({ type: SITES_FOR_WEEK_LOAD_FINISH, data });
  } catch (error) {
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
};

const actionHandlers = {
  [SITES_FOR_WEEK_LOAD_START]: () => ({
    error: defaultState.error,
    status: STATUSES.LOADING,
  }),
  [SITES_FOR_WEEK_LOAD_FINISH]: ({ data }) => ({
    status: STATUSES.SUCCESS,
    data: data,
  }),
  [SITES_FOR_WEEK_LOAD_ERROR]: ({ error }) => ({
    status: STATUSES.ERROR,
    error: error.message,
  }),
};

export const site = createReducer(defaultState, actionHandlers);
