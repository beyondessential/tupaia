/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  SET_DISASTERS_DATA,
  FETCH_DISASTERS_ERROR,
  SELECT_DISASTER,
  VIEW_DISASTER,
} from '../actions';

export function setDisastersData(data) {
  return {
    type: SET_DISASTERS_DATA,
    data,
  };
}

export function fetchDisastersError(error) {
  return {
    type: FETCH_DISASTERS_ERROR,
    error,
  };
}

export function selectDisaster(disaster) {
  return {
    type: SELECT_DISASTER,
    disaster,
  };
}

export function viewDisaster(disaster) {
  return {
    type: VIEW_DISASTER,
    disaster,
  };
}
