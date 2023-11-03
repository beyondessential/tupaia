/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';
import {
  WEB_SET_CAN_GO_BACK,
  WEB_SET_CAN_GO_FORWARD,
  WEB_SET_CURRENT_URL,
  WEB_SET_BASE_URL,
  WEB_SET_IS_LOADING,
} from './constants';

const defaultState = {
  baseUrl: '',
  currentUrl: '',
  isLoading: false,
  canGoBack: false,
  canGoForward: false,
};

const stateChanges = {
  [WEB_SET_CAN_GO_BACK]: ({ canGoBack }) => ({
    canGoBack,
  }),
  [WEB_SET_CAN_GO_FORWARD]: ({ canGoForward }) => ({
    canGoForward,
  }),
  [WEB_SET_BASE_URL]: ({ baseUrl }) => ({
    baseUrl,
    currentUrl: baseUrl,
    isLoading: false,
  }),
  [WEB_SET_CURRENT_URL]: ({ currentUrl }) => ({
    currentUrl,
  }),
  [WEB_SET_IS_LOADING]: ({ isLoading }) => ({
    isLoading,
  }),
};

export const reducer = createReducer(defaultState, stateChanges);
