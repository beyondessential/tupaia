import { createReducer } from '../utilities';
import {
  EDITOR_DATA_FETCH_BEGIN,
  EDITOR_DATA_FETCH_SUCCESS,
  EDITOR_DATA_EDIT_BEGIN,
  EDITOR_DATA_EDIT_SUCCESS,
  EDITOR_DISMISS,
  EDITOR_ERROR,
  EDITOR_FIELD_EDIT,
  SET_VALIDATION_ERRORS,
  LOAD_EDITOR,
  OPEN_EDIT_MODAL,
  RESET_EDITS,
} from './constants';

const defaultState = {
  error: null,
  isOpen: false,
  isLoading: false,
  endpoint: null,
  recordId: null,
  recordData: null,
  fields: [],
  FieldsComponent: null,
  title: 'Edit',
  editedFields: {},
  extraDialogProps: {},
  validationErrors: {},
};

const stateChanges = {
  [EDITOR_DATA_FETCH_BEGIN]: payload => {
    return {
      isLoading: true,
      ...payload,
    };
  },
  [EDITOR_DATA_EDIT_BEGIN]: payload => ({
    isLoading: true,
    error: null,
    ...payload,
  }),
  [EDITOR_DATA_FETCH_SUCCESS]: payload => ({
    isLoading: false,
    ...payload,
  }),
  [EDITOR_DATA_EDIT_SUCCESS]: payload => ({
    isLoading: false,
    ...payload,
  }),
  [EDITOR_ERROR]: payload => ({
    isLoading: false,
    ...payload,
  }),
  [EDITOR_DISMISS]: (payload, { error }) => {
    if (error) {
      return { error: defaultState.error }; // If there is an error, dismiss it
    }
    return defaultState; // If no error, dismiss the whole modal and clear its state
  },
  [LOAD_EDITOR]: payload => {
    return { ...payload, error: null };
  },
  [OPEN_EDIT_MODAL]: ({ recordId }) => ({ recordId, isOpen: true }),
  [EDITOR_FIELD_EDIT]: (
    { fieldKey, newValue, otherValidationErrorsToClear = [] },
    { editedFields, validationErrors },
  ) => ({
    editedFields: {
      ...editedFields,
      [fieldKey]: newValue,
    },
    validationErrors: {
      ...validationErrors,
      [fieldKey]: null, // Clear the validation error for this field as the user has made a change
      // clear nested validation errors when editing a field
      ...otherValidationErrorsToClear.reduce((acc, key) => {
        acc[key] = null;
        return acc;
      }, {}),
    },
  }),
  [SET_VALIDATION_ERRORS]: payload => ({
    validationErrors: payload,
  }),
  [RESET_EDITS]: () => ({ editedFields: {}, error: null }),
};

export const reducer = createReducer(defaultState, stateChanges);
