/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import {
  WEB_SET_CAN_GO_BACK,
  WEB_SET_CAN_GO_FORWARD,
  WEB_SET_BASE_URL,
  WEB_SET_CURRENT_URL,
  WEB_SET_IS_LOADING,
} from './constants';

export const setCanGoBack = canGoBack => ({
  type: WEB_SET_CAN_GO_BACK,
  canGoBack,
});

export const setCanGoForward = canGoForward => ({
  type: WEB_SET_CAN_GO_FORWARD,
  canGoForward,
});

export const setBaseUrl = baseUrl => ({
  type: WEB_SET_BASE_URL,
  baseUrl,
});

export const setCurrentUrl = currentUrl => ({
  type: WEB_SET_CURRENT_URL,
  currentUrl,
});

export const setIsLoading = isLoading => ({
  type: WEB_SET_IS_LOADING,
  isLoading,
});
