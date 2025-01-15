import { createNestedReducer } from '../utilities';
import {
  DEFAULT_AUTOCOMPLETE_STATE,
  AUTOCOMPLETE_INPUT_CHANGE,
  AUTOCOMPLETE_RESULTS_CHANGE,
  AUTOCOMPLETE_SEARCH_FAILURE,
  AUTOCOMPLETE_SELECTION_CHANGE,
  AUTOCOMPLETE_RESET,
} from './constants';
import { getFetchId } from './selectors';

const stateChanges = {
  [AUTOCOMPLETE_INPUT_CHANGE]: payload => ({
    ...payload,
    isLoading: true,
  }),
  [AUTOCOMPLETE_RESULTS_CHANGE]: ({ fetchId, ...restOfPayload }, currentState) => {
    const currentFetchId = getFetchId(currentState);
    if (fetchId !== currentFetchId) return {}; // From a previous fetch request, ignore it
    return {
      ...restOfPayload,
      isLoading: false,
      fetchId: null,
    };
  },
  [AUTOCOMPLETE_SELECTION_CHANGE]: payload => ({
    ...payload,
    searchTerm: '',
  }),
  [AUTOCOMPLETE_SEARCH_FAILURE]: ({ fetchId }, currentState) => {
    const currentFetchId = getFetchId(currentState);
    if (fetchId !== currentFetchId) return {}; // From a previous fetch request, ignore it
    return {
      results: DEFAULT_AUTOCOMPLETE_STATE.results,
      isLoading: false,
      fetchId: null,
    };
  },
  [AUTOCOMPLETE_RESET]: () => DEFAULT_AUTOCOMPLETE_STATE,
};

export const reducer = createNestedReducer(DEFAULT_AUTOCOMPLETE_STATE, stateChanges);
