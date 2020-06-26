/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { createReducer } from '../../utils/createReducer';
import { reloadCountryWeeks } from './country';

// actions
const SET_ACTIVE_WEEK = 'SET_ACTIVE_WEEK';
const TOGGLE_PANEL = 'TOGGLE_PANEL';
const VERIFY_SYNDROME = 'VERIFY_SYNDROME';
const SET_VERIFIED_STATUSES = 'SET_DEFAULT_VERIFIED_STATUSES';

// action creators
export const openWeeklyReportsPanel = () => dispatch => {
  dispatch(setDefaultVerifiedStatuses());
  dispatch({ type: TOGGLE_PANEL, panelIsOpen: true });
};
export const closeWeeklyReportsPanel = () => ({ type: TOGGLE_PANEL, panelIsOpen: false });
export const setActiveWeek = id => ({ type: SET_ACTIVE_WEEK, id });
export const updateVerifiedStatus = id => ({ type: VERIFY_SYNDROME, id });
export const setDefaultVerifiedStatuses = () => (dispatch, getState) => {
  const state = getState();
  const activeCountryWeekData = getActiveWeekCountryData(state);

  const verifiedStatuses = activeCountryWeekData.reduce(
    (object, item) => ({
      ...object,
      [item.id]: item.percentageChange > 10 ? false : null,
    }),
    {},
  );

  dispatch({ type: SET_VERIFIED_STATUSES, verifiedStatuses });
};
export const updateWeeklyReportsData = () => async dispatch => {
  await dispatch(reloadCountryWeeks({}));
  dispatch(setDefaultVerifiedStatuses());
};
export const confirmWeeklyReportsData = () => async dispatch => {
  console.log('confirm data..., post data to server...');
  dispatch(updateWeeklyReportsData());
};

// selectors
export const checkWeeklyReportsPanelIsOpen = ({ weeklyReports }) =>
  weeklyReports.activeWeek.panelIsOpen;
export const getActiveWeekId = ({ weeklyReports }) => weeklyReports.activeWeek.id;
export const checkWeeklyReportAreVerified = ({ weeklyReports }) =>
  Object.values(weeklyReports.activeWeek.verifiedStatuses).every(status => status !== false);
export const getVerifiedStatuses = ({ weeklyReports }) => weeklyReports.activeWeek.verifiedStatuses;
export const getActiveWeekCountryData = ({ weeklyReports }) => {
  if (weeklyReports.activeWeek.id !== null) {
    // Todo: refactor to find by id when there is real data
    const activeCountryWeek = weeklyReports.country.data.find(
      item => item.index === weeklyReports.activeWeek.id,
    );
    return activeCountryWeek.syndromes;
  }

  return [];
};

// reducer
const defaultState = {
  id: null,
  verifiedStatuses: {},
  panelIsOpen: false,
};

const actionHandlers = {
  [SET_ACTIVE_WEEK]: ({ id }) => ({
    id,
  }),
  [TOGGLE_PANEL]: ({ panelIsOpen }) => ({
    panelIsOpen,
  }),
  [SET_VERIFIED_STATUSES]: ({ verifiedStatuses }) => ({
    verifiedStatuses,
  }),
  [VERIFY_SYNDROME]: ({ id }, { verifiedStatuses }) => ({
    verifiedStatuses: {
      ...verifiedStatuses,
      [id]: true,
    },
  }),
};

export const activeWeek = createReducer(defaultState, actionHandlers);
