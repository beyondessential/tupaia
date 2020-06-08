/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { createReducer } from '../../utils/createReducer';

// actions
const SET_ACTIVE_WEEK = 'SET_ACTIVE_WEEK';
const OPEN_PANEL = 'OPEN_PANEL';
const CLOSE_PANEL = 'CLOSE_PANEL';
const VERIFY_SYNDROME = 'VERIFY_SYNDROME';

// action creators
export const openWeeklyReportsPanel = () => (dispatch, getState) => {
  const state = getState();
  const activeCountryWeekData = getActiveWeekCountryData(state);

  const verifiedStatuses = activeCountryWeekData.reduce((object, item) => {
    return {
      ...object,
      [item.id]: item.percentageChange > 10 ? false : null,
    };
  }, {});

  dispatch({ type: OPEN_PANEL, verifiedStatuses });
};
export const closeWeeklyReportsPanel = () => ({ type: CLOSE_PANEL });
export const setActiveWeek = id => ({ type: SET_ACTIVE_WEEK, id });
export const updateVerifiedStatus = id => {
  return { type: VERIFY_SYNDROME, id };
};
export const confirmWeeklyReportsData = () => async () => {
  console.log('confirm data...');
};

// selectors
export const checkWeeklyReportsPanelIsOpen = ({ weeklyReports }) =>
  weeklyReports.activeWeek.panelIsOpen;

export const getActiveWeekId = ({ weeklyReports }) => weeklyReports.activeWeek.id;

export const getVerifiedStatuses = ({ weeklyReports }) => weeklyReports.activeWeek.verifiedStatuses;

export const getActiveWeekCountryData = ({ weeklyReports }) => {
  if (weeklyReports.activeWeek.id !== null) {
    return weeklyReports.country.data[weeklyReports.activeWeek.id].syndromes;
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
  [OPEN_PANEL]: ({ verifiedStatuses }) => ({
    panelIsOpen: true,
    verifiedStatuses,
  }),
  [CLOSE_PANEL]: () => ({
    panelIsOpen: false,
    verifiedStatus: defaultState.verifiedStatus,
  }),
  [VERIFY_SYNDROME]: ({ id }, { verifiedStatuses }) => ({
    verifiedStatuses: {
      ...verifiedStatuses,
      [id]: true,
    },
  }),
};

export const activeWeek = createReducer(defaultState, actionHandlers);
