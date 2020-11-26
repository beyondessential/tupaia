/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { createReducer } from '../utils/createReducer';

// actions
const SET_ACTIVE_WEEK = 'SET_ACTIVE_WEEK';
const TOGGLE_PANEL = 'TOGGLE_PANEL';
const VERIFY_SYNDROME = 'VERIFY_SYNDROME';
const CLEAR_VERIFIED_STATUSES = 'CLEAR_VERIFIED_STATUSES';

// action creators
export const openWeeklyReportsPanel = () => dispatch => {
  dispatch({ type: CLEAR_VERIFIED_STATUSES });
  dispatch({ type: TOGGLE_PANEL, panelIsOpen: true });
};

export const closeWeeklyReportsPanel = () => ({ type: TOGGLE_PANEL, panelIsOpen: false });

export const setActiveWeek = id => ({ type: SET_ACTIVE_WEEK, id });

export const updateVerifiedStatus = id => ({ type: VERIFY_SYNDROME, id });

// selectors
export const checkWeeklyReportsPanelIsOpen = ({ weeklyReports }) => weeklyReports.panelIsOpen;

export const getActiveWeekId = ({ weeklyReports }) => weeklyReports.id;

export const getVerifiedStatus = ({ weeklyReports }, syndromeId) =>
  weeklyReports.verifiedStatuses.includes(syndromeId);

export const getUnVerifiedSyndromes = ({ weeklyReports }, alerts) =>
  alerts.reduce(
    (list, syndrome) =>
      weeklyReports.verifiedStatuses.includes(syndrome.id) ? list : [...list, syndrome.id],
    [],
  );

// reducer
const defaultState = {
  id: null, // Todo: update to be the latest week by default??
  panelIsOpen: false,
  verifiedStatuses: [],
};

const actionHandlers = {
  [SET_ACTIVE_WEEK]: ({ id }) => ({
    id,
  }),
  [TOGGLE_PANEL]: ({ panelIsOpen }) => ({
    panelIsOpen,
  }),
  [CLEAR_VERIFIED_STATUSES]: () => ({
    verifiedStatuses: defaultState.verifiedStatuses,
  }),
  [VERIFY_SYNDROME]: ({ id }, { verifiedStatuses }) => ({
    verifiedStatuses: [...verifiedStatuses, id],
  }),
};

export const weeklyReports = createReducer(defaultState, actionHandlers);
