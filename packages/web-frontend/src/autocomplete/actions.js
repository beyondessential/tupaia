/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */
// import { v1 as generateId } from 'uuid';
// import { convertSearchTermToFilter, makeSubstitutionsInString } from '../utils';
import { AUTOCOMPLETE_SELECTION_CHANGE, AUTOCOMPLETE_RESET } from '../actions';

export const changeSelection = (reduxId, selection) => ({
  type: AUTOCOMPLETE_SELECTION_CHANGE,
  selection,
  reduxId,
});

export const clearState = reduxId => ({
  type: AUTOCOMPLETE_RESET,
  reduxId,
});
