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
export const openWeeklyReportsPanel = id => dispatch => {
  if (id !== null) {
    dispatch(setActiveWeek(id));
  }
  dispatch(setDefaultVerifiedStatuses());
  dispatch({ type: TOGGLE_PANEL, panelIsOpen: true });
};

export const closeWeeklyReportsPanel = () => ({ type: TOGGLE_PANEL, panelIsOpen: false });

export const setActiveWeek = id => ({ type: SET_ACTIVE_WEEK, id });

export const updateWeeklyReportsData = () => async dispatch => {
  await dispatch(reloadCountryWeeks({}));
  dispatch(setDefaultVerifiedStatuses());
};

export const confirmWeeklyReportsData = () => async dispatch => {
  console.log('confirm data..., post data to server...');
  dispatch(updateWeeklyReportsData());
};

export const updateVerifiedStatus = id => ({ type: VERIFY_SYNDROME, id });

export const setDefaultVerifiedStatuses = () => (dispatch, getState) => {
  const state = getState();
  const activeCountryWeekData = getActiveWeekCountryData(state).syndromes;
  const verifiedStatuses = activeCountryWeekData.reduce(
    (statuses, syndrome) => ({ ...statuses, [syndrome.id]: syndrome.isAlert ? false : null }),
    {},
  );

  dispatch({ type: SET_VERIFIED_STATUSES, verifiedStatuses });
};

// selectors
export const checkWeeklyReportsPanelIsOpen = ({ weeklyReports }) =>
  weeklyReports.activeWeek.panelIsOpen;

export const getActiveWeekId = ({ weeklyReports }) => weeklyReports.activeWeek.id;

export const getActiveWeekCountryData = ({ weeklyReports }) => {
  if (weeklyReports.activeWeek.id !== null) {
    // Todo: refactor to find by id when there is real data
    return weeklyReports.country.data.find(item => item.index === weeklyReports.activeWeek.id);
  }

  return {};
};

export const getSyndromeAlerts = state => {
  const data = getActiveWeekCountryData(state);
  if (!data.syndromes) {
    return [];
  }
  return data.syndromes.reduce(
    (statuses, syndrome) => (syndrome.isAlert ? [...statuses, syndrome] : statuses),
    [],
  );
};

export const checkHasAlerts = state => getSyndromeAlerts(state).length > 0;

export const getVerifiedStatuses = ({ weeklyReports }) => weeklyReports.activeWeek.verifiedStatuses;

export const getVerifiedStatus = (state, syndromeId) => {
  const statuses = getVerifiedStatuses(state);
  return statuses[syndromeId];
};

export const getUnVerifiedSyndromes = state =>
  Object.entries(getVerifiedStatuses(state)).reduce(
    (statuses, [key, value]) => (value === false ? [...statuses, key] : statuses),
    [],
  );

export const checkAlertsAreVerified = state => getUnVerifiedSyndromes(state).length > 0;

// reducer
const defaultState = {
  id: null,
  panelIsOpen: false,
  verifiedStatuses: {},
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
