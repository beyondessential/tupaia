import { createReducer } from '../utilities';
import { QR_CODE_MODAL_DISMISS, QR_CODE_MODAL_OPEN } from './constants';

const defaultState = {
  isOpen: false,
  recordId: null,
  recordData: null,
};

const stateChanges = {
  [QR_CODE_MODAL_OPEN]: payload => ({
    isOpen: true,
    ...payload,
  }),
  [QR_CODE_MODAL_DISMISS]: payload => ({
    isOpen: false,
    ...payload,
  }),
};

export const reducer = createReducer(defaultState, stateChanges);
