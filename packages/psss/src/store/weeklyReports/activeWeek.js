/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { createReducer } from '../../utils/createReducer';

// actions
const SET_ACTIVE_WEEK = 'SET_ACTIVE_WEEK';
const OPEN_PANEL = 'OPEN_PANEL';
const CLOSE_PANEL = 'CLOSE_PANEL';

// action creators
export const openWeeklyReportsPanel = () => ({ type: OPEN_PANEL });
export const closeWeeklyReportsPanel = () => ({ type: CLOSE_PANEL });
export const setActiveWeek = id => ({ type: SET_ACTIVE_WEEK, id });

// selectors
export const checkWeeklyReportsPanelIsOpen = ({ weeklyReports }) => weeklyReports.activeWeek.id;
export const getActiveWeekId = ({ weeklyReports }) => weeklyReports.activeWeek.id;

// reducer
const defaultState = {
  id: null,
  syndromeVerifiedStatus: {},
  panelIsOpen: false,
};

const actionHandlers = {
  [SET_ACTIVE_WEEK]: ({ id }) => ({
    id: id,
    syndromeVerifiedStatus: {
      '1': null,
      '2': true,
      '3': false,
    },
  }),
  [OPEN_PANEL]: () => ({
    panelIsOpen: true,
  }),
  [CLOSE_PANEL]: () => ({
    panelIsOpen: false,
  }),
};

export const activeWeek = createReducer(defaultState, actionHandlers);
