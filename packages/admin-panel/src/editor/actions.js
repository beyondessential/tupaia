/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import {
  EDITOR_DATA_EDIT_BEGIN,
  EDITOR_DATA_EDIT_SUCCESS,
  EDITOR_DATA_FETCH_BEGIN,
  EDITOR_DATA_FETCH_SUCCESS,
  EDITOR_DISMISS,
  EDITOR_ERROR,
  EDITOR_FIELD_EDIT,
  EDITOR_OPEN_CREATOR,
} from './constants';

export const openEditModal = ({ editEndpoint, fields }, recordId) => async (
  dispatch,
  getState,
  { api },
) => {
  if (recordId) {
    const endpoint = `${editEndpoint}/${recordId}`;
    dispatch({
      type: EDITOR_DATA_FETCH_BEGIN,
      fields,
      endpoint,
    });

    try {
      const response = await api.get(endpoint, {
        columns: JSON.stringify(
          fields
            .filter(field => !field.hideValue) // Ignore any that will be hidden, e.g. passwords
            .map(field => field.source),
        ), // Fetch fields based on their source
      });
      dispatch({
        type: EDITOR_DATA_FETCH_SUCCESS,
        recordData: response.body,
      });
    } catch (error) {
      dispatch({
        type: EDITOR_ERROR,
        errorMessage: error.message,
      });
    }
  } else {
    dispatch({
      type: EDITOR_OPEN_CREATOR,
      fields,
      recordData: {},
      endpoint: editEndpoint,
    });
  }
};

export const editField = (fieldKey, newValue) => ({
  type: EDITOR_FIELD_EDIT,
  fieldKey,
  newValue,
});

export const saveEdits = (endpoint, editedFields, isNew) => async (dispatch, getState, { api }) => {
  dispatch({
    type: EDITOR_DATA_EDIT_BEGIN,
  });
  try {
    if (isNew) {
      await api.post(endpoint, null, editedFields);
    } else {
      await api.put(endpoint, null, editedFields);
    }
    dispatch({
      type: EDITOR_DATA_EDIT_SUCCESS,
    });
    dispatch(closeEditModal());
  } catch (error) {
    dispatch({
      type: EDITOR_ERROR,
      errorMessage: error.message,
    });
  }
};

export const closeEditModal = () => ({
  type: EDITOR_DISMISS,
});
