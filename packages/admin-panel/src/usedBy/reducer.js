import { createReducer } from '../utilities';
import { USED_BY_FETCH_BEGIN, USED_BY_FETCH_SUCCESS, USED_BY_FETCH_ERROR } from './constants';

const defaultState = {
  errorMessage: '',
  isLoading: false,
  byRecordId: {}, // map of record id -> usedBy array
};

const stateChanges = {
  [USED_BY_FETCH_BEGIN]: payload => ({
    isLoading: true,
    ...payload,
  }),
  [USED_BY_FETCH_SUCCESS]: (payload, state) => ({
    isLoading: false,
    byRecordId: { ...state.byRecordId, ...{ [payload.recordId]: payload.usedBy } }, // immutable append
  }),
  [USED_BY_FETCH_ERROR]: payload => ({
    isLoading: false,
    ...payload,
  }),
};

export const reducer = createReducer(defaultState, stateChanges);
