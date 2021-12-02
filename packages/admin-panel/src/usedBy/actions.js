/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { USED_BY_FETCH_BEGIN, USED_BY_FETCH_ERROR, USED_BY_FETCH_SUCCESS } from './constants';
import { getDataSourceUsedBy } from './api';

const SUPPORTED_RECORD_TYPES = {
  dataSource: getDataSourceUsedBy,
};

export const fetchUsedBy = (recordType, recordId) => async (dispatch, getState, { api }) => {
  dispatch({
    type: USED_BY_FETCH_BEGIN,
  });

  const getUsedBy = SUPPORTED_RECORD_TYPES[recordType] ?? null;
  if (!getUsedBy) {
    throw new Error('Unsupported record type');
  }

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
