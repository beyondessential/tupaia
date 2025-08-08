import { createReducer } from '../utils/createReducer';
import { getCurrentPeriod } from '../utils';

// actions
const SET_ACTIVE_WEEK = 'SET_ACTIVE_WEEK';
const SET_LATEST_VIEWABLE_WEEK = 'SET_LATEST_VIEWABLE_WEEK';
const TOGGLE_PANEL = 'TOGGLE_PANEL';
const VERIFY_SYNDROME = 'VERIFY_SYNDROME';
const CLEAR_VERIFIED_STATUSES = 'CLEAR_VERIFIED_STATUSES';

// action creators
export const openWeeklyReportsPanel = period => dispatch => {
  dispatch({ type: SET_ACTIVE_WEEK, activeWeek: period });
  dispatch({ type: CLEAR_VERIFIED_STATUSES });
  dispatch({ type: TOGGLE_PANEL, panelIsOpen: true });
};

export const closeWeeklyReportsPanel = () => ({ type: TOGGLE_PANEL, panelIsOpen: false });

export const setLatestViewableWeek = latestViewableWeek => ({
  type: SET_LATEST_VIEWABLE_WEEK,
  latestViewableWeek,
});

export const updateVerifiedStatus = id => ({ type: VERIFY_SYNDROME, id });

// selectors
export const checkWeeklyReportsPanelIsOpen = ({ weeklyReports }) => weeklyReports.panelIsOpen;

export const getActiveWeek = ({ weeklyReports }) => weeklyReports.activeWeek;

export const getLatestViewableWeek = ({ weeklyReports }) => weeklyReports.latestViewableWeek;

export const getVerifiedStatus = ({ weeklyReports }, syndromeId) =>
  weeklyReports.verifiedStatuses.includes(syndromeId);

// reducer
const defaultPeriod = getCurrentPeriod();

const defaultState = {
  latestViewableWeek: defaultPeriod,
  activeWeek: defaultPeriod,
  panelIsOpen: false,
  verifiedStatuses: [],
};

const actionHandlers = {
  [SET_ACTIVE_WEEK]: ({ activeWeek }) => ({
    activeWeek,
  }),
  [SET_LATEST_VIEWABLE_WEEK]: ({ latestViewableWeek }) => ({
    latestViewableWeek,
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
