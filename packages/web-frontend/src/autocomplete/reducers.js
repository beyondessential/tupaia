/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import {
  AUTOCOMPLETE_INPUT_CHANGE,
  AUTOCOMPLETE_RESULTS_CHANGE,
  AUTOCOMPLETE_SEARCH_FAILURE,
  AUTOCOMPLETE_SELECTION_CHANGE,
  AUTOCOMPLETE_RESET,
} from '../actions';
import { DEFAULT_AUTOCOMPLETE_STATE } from './constants';
import { getFetchId } from '../selectors';

export function autocomplete(state = DEFAULT_AUTOCOMPLETE_STATE, action) {
  switch (action.type) {
    case AUTOCOMPLETE_INPUT_CHANGE:
      return {
        ...state,
        isLoading: true,
      };
    case AUTOCOMPLETE_RESULTS_CHANGE: {
      const currentFetchId = getFetchId(state);
      if (action.fetchId !== currentFetchId) return {}; // From a previous fetch request, ignore it
      return {
        ...state,
        isLoading: false,
        fetchId: null,
      };
    }
    case AUTOCOMPLETE_SELECTION_CHANGE:
      return {
        ...state,
        searchTerm: '',
        [action.reduxId]: action.reduxId,
        selection: action.selection,
      };
    case AUTOCOMPLETE_SEARCH_FAILURE: {
      const currentFetchId = getFetchId(state);
      if (action.fetchId !== currentFetchId) return {}; // From a previous fetch request, ignore it
      return {
        results: DEFAULT_AUTOCOMPLETE_STATE.results,
        isLoading: false,
        fetchId: null,
      };
    }
    case AUTOCOMPLETE_RESET:
      return DEFAULT_AUTOCOMPLETE_STATE;
    default:
      return state;
  }
}
