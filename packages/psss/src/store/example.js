/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utils/createReducer';

// actions

export const example = () => async (dispatch, getState, { api }) => {
  dispatch({ type: 'INCREMENT' });
};

export const loadAlerts = () => async (dispatch, getState, { api }) => {
  const alerts = await api.get('alerts');
  dispatch({ type: 'LOAD_ALERTS', alerts });
};

// selectors

export const getAlerts = state => {
  return state.example.alerts;
};

// reducers

const defaultState = {
  counter: 0,
  alerts: [],
};

const handlers = {
  INCREMENT: (payload, state) => ({ ...state, counter: state.counter + 1 }),
  LOAD_ALERTS: (payload, state) => ({ ...state, alerts: payload.alerts.body }),
};

export const exampleReducer = createReducer(defaultState, handlers);
