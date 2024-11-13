/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';
import {
  RESUBMIT_SURVEY_RESPONSE_OPEN,
  RESUBMIT_SURVEY_DISMISS,
  ARCHIVE_SURVEY_RESPONSE_OPEN,
  ARCHIVE_SURVEY_RESPONSE_DISMISS,
} from './constants';

const defaultState = {
  isResubmitModalOpen: false,
  isArchiveModalOpen: false,
};

const stateChanges = {
  [RESUBMIT_SURVEY_DISMISS]: () => ({
    ...defaultState,
  }),
  [ARCHIVE_SURVEY_RESPONSE_DISMISS]: () => ({
    ...defaultState,
  }),
  [RESUBMIT_SURVEY_RESPONSE_OPEN]: payload => ({ ...payload, isResubmitModalOpen: true }),
  [ARCHIVE_SURVEY_RESPONSE_OPEN]: payload => {
    return {
      ...defaultState,
      ...payload,
      isArchiveModalOpen: true,
    };
  },
};

export const reducer = createReducer(defaultState, stateChanges);
