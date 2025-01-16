import { DEFAULT_AUTOCOMPLETE_STATE } from './constants';

export const getAutocompleteState = (state, reduxId) =>
  state.autocomplete[reduxId] || DEFAULT_AUTOCOMPLETE_STATE;

export const getFetchId = autocompleteState => autocompleteState.fetchId;
