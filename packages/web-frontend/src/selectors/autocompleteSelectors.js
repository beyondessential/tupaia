/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { DEFAULT_AUTOCOMPLETE_STATE } from '../autocomplete';

export const getAutocompleteState = (state, reduxId) =>
  state.autocomplete[reduxId] || DEFAULT_AUTOCOMPLETE_STATE;

export const getFetchId = autocompleteState => autocompleteState.fetchId;
