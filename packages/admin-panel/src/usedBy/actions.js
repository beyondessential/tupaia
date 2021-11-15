/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { USED_BY_FETCH_BEGIN, USED_BY_FETCH_ERROR, USED_BY_FETCH_SUCCESS } from './constants';
import { getUsedBy } from './api';

export const fetchUsedBy = (recordType, recordId) => async (dispatch, getState, { api }) => {
  dispatch({
    type: USED_BY_FETCH_BEGIN,
  });

  try {
    const usedBy = await getUsedBy(api, recordType, recordId);
    dispatch({
      type: USED_BY_FETCH_SUCCESS,
      recordId,
      usedBy,
    });
  } catch (error) {
    dispatch({
      type: USED_BY_FETCH_ERROR,
      errorMessage: error.message,
    });
  }
};
