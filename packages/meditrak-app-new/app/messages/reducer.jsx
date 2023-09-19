/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';
import { MESSAGE_ADD, MESSAGE_REMOVE, MESSAGE_TYPES } from './constants';

const defaultOptions = {
  type: MESSAGE_TYPES.BANNER,
};

const defaultState = {
  items: {},
};

const stateChanges = {
  [MESSAGE_ADD]: ({ key, message, options }, state) => ({
    items: {
      ...state.items,
      [key]: {
        message,
        options: {
          ...defaultOptions,
          ...options,
        },
      },
    },
  }),
  [MESSAGE_REMOVE]: ({ key }, state) => {
    const items = { ...state.items };
    delete items[key];
    return {
      items,
    };
  },
};

export const reducer = createReducer(defaultState, stateChanges);
