/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { createReducer } from '../../utils/createReducer';

// actions
const SET_ACTIVE_WEEK = 'SET_ACTIVE_WEEK';
const OPEN_PANEL = 'OPEN_PANEL';
const CLOSE_PANEL = 'CLOSE_PANEL';
const UPDATE_VERIFIED_STATUS = 'UPDATE_VERIFIED_STATUS';

// action creators
export const openWeeklyReportsPanel = () => (dispatch, getState) => {
  const state = getState();
  const activeCountryWeekData = getActiveCountryWeekData(state);
  dispatch({ type: OPEN_PANEL, activeCountryWeekData });
};
export const closeWeeklyReportsPanel = () => ({ type: CLOSE_PANEL });
export const setActiveWeek = id => ({ type: SET_ACTIVE_WEEK, id });
export const updateVerifiedStatus = id => {
  return { type: UPDATE_VERIFIED_STATUS, id };
};

// selectors
export const checkWeeklyReportsPanelIsOpen = ({ weeklyReports }) =>
  weeklyReports.activeWeek.panelIsOpen;

export const getActiveWeekId = ({ weeklyReports }) => weeklyReports.activeWeek.id;

export const getVerifiedStatuses = ({ weeklyReports }) => weeklyReports.activeWeek.verifiedStatuses;

export const getActiveCountryWeekData = ({ weeklyReports }) => {
  if (weeklyReports.activeWeek.id !== null) {
    return weeklyReports.country.data[weeklyReports.activeWeek.id].indicators;
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
    id: id,
  }),
  [OPEN_PANEL]: ({ activeCountryWeekData }) => {
    const verifiedStatuses = activeCountryWeekData.reduce((object, item) => {
      return {
        ...object,
        [item.id]: item.percentageChange > 10 ? false : null,
      };
    }, {});

    return {
      panelIsOpen: true,
      verifiedStatuses,
    };
  },
  [CLOSE_PANEL]: () => ({
    panelIsOpen: false,
    verifiedStatus: defaultState.verifiedStatus,
  }),
  [UPDATE_VERIFIED_STATUS]: ({ id }, { verifiedStatuses }) => ({
    verifiedStatuses: {
      ...verifiedStatuses,
      [id]: true,
    },
  }),
};

export const activeWeek = createReducer(defaultState, actionHandlers);
