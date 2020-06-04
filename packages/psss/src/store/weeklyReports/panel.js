/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// actions
const OPEN_PANEL = 'OPEN_PANEL';
const CLOSE_PANEL = 'CLOSE_PANEL';

// action creators
export const openWeeklyReportsPanel = () => ({ type: OPEN_PANEL });

export const closeWeeklyReportsPanel = () => ({ type: CLOSE_PANEL });

// reducer
const defaultState = false;

export const panel = (state = defaultState, action) => {
  switch (action.type) {
    case OPEN_PANEL:
      return true;
    case CLOSE_PANEL:
      return false;
    default:
      return state;
  }
};
