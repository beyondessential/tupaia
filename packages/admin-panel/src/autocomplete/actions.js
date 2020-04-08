/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import generateId from 'uuid/v1';
import { convertFilterToString } from '../utilities';
import {
  AUTOCOMPLETE_INPUT_CHANGE,
  AUTOCOMPLETE_RESULTS_CHANGE,
  AUTOCOMPLETE_SEARCH_FAILURE,
  AUTOCOMPLETE_SELECTION_CHANGE,
  AUTOCOMPLETE_RESET,
  MAX_AUTOCOMPLETE_RESULTS,
} from './constants';

export const changeSelection = (reduxId, selection) => ({
  type: AUTOCOMPLETE_SELECTION_CHANGE,
  selection,
  reduxId,
});

export const changeSearchTerm = (reduxId, endpoint, column, searchTerm, searchTermFilter) => async (
  dispatch,
  getState,
  { api },
) => {
  const fetchId = generateId();
  dispatch({
    type: AUTOCOMPLETE_INPUT_CHANGE,
    searchTerm,
    reduxId,
    fetchId,
  });
  try {
    const filter = convertFilterToString({ [column]: searchTerm, ...searchTermFilter });
    console.log('FILTER', filter);
    const response = await api.get(endpoint, { filter, pageSize: MAX_AUTOCOMPLETE_RESULTS });
    dispatch({
      type: AUTOCOMPLETE_RESULTS_CHANGE,
      results: response.body,
      reduxId,
      fetchId,
    });
  } catch (error) {
    dispatch({
      type: AUTOCOMPLETE_SEARCH_FAILURE,
      reduxId,
      fetchId,
    });
  }
};

export const clearState = reduxId => ({
  type: AUTOCOMPLETE_RESET,
  reduxId,
});
