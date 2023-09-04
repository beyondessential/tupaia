/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';
import { RESUBMIT_SURVEY_RESPONSE_OPEN, RESUBMIT_SURVEY_DISMISS } from './constants';

const defaultState = {
  isOpen: false,
};

const stateChanges = {
  [RESUBMIT_SURVEY_DISMISS]: () => ({
    ...defaultState,
  }),
  [RESUBMIT_SURVEY_RESPONSE_OPEN]: payload => ({ ...payload, isOpen: true }),
};

export const reducer = createReducer(defaultState, stateChanges);
