/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// actions
const SET_ACTIVE_WEEK = 'SET_ACTIVE_WEEK';

// action creators
export const setActiveWeek = id => ({ type: SET_ACTIVE_WEEK, id });

// selectors
export const getActiveWeek = ({ weeklyReports }) => weeklyReports.activeWeekId;

// reducer
const defaultState = null;

export const activeWeek = (state = defaultState, action) => {
  switch (action.type) {
    case SET_ACTIVE_WEEK:
      return action.id;
    default:
      return state;
  }
};
