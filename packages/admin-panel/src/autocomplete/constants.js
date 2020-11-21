/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const DEFAULT_AUTOCOMPLETE_STATE = {
  selection: [],
  searchTerm: '',
  results: [],
  isLoading: false,
  fetchId: null,
};

export const MAX_AUTOCOMPLETE_RESULTS = 10;

export const AUTOCOMPLETE_INPUT_CHANGE = 'AUTOCOMPLETE_INPUT_CHANGE';
export const AUTOCOMPLETE_RESULTS_CHANGE = 'AUTOCOMPLETE_RESULTS_CHANGE';
export const AUTOCOMPLETE_SEARCH_FAILURE = 'AUTOCOMPLETE_SEARCH_FAILURE';
export const AUTOCOMPLETE_SELECTION_CHANGE = 'AUTOCOMPLETE_SELECTION_CHANGE';
export const AUTOCOMPLETE_RESET = 'AUTOCOMPLETE_RESET';
