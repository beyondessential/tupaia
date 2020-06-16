/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utils/createReducer';

// actions
const OPEN_PANEL = 'OPEN_PANEL';
const CLOSE_PANEL = 'CLOSE_PANEL';

// action creators
export const openAlertsPanel = () => ({
  type: OPEN_PANEL,
});

export const closeAlertsPanel = () => ({
  type: CLOSE_PANEL,
});

// selectors
export const checkAlertsPanelIsOpen = ({ alerts }) => alerts.panelIsOpen;

// reducer
const defaultState = {
  panelIsOpen: false,
};

const actionHandlers = {
  [OPEN_PANEL]: () => ({
    panelIsOpen: true,
  }),
  [CLOSE_PANEL]: () => ({
    panelIsOpen: false,
  }),
};

export const alerts = createReducer(defaultState, actionHandlers);
