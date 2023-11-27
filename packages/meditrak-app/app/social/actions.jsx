/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { SOCIAL_FEED_REQUEST, SOCIAL_FEED_SUCCESS, SOCIAL_FEED_FAILURE } from './constants';

export const loadSocialFeedLatest = () => async dispatch => {
  dispatch(fetchSocialFeed(0, true));
};

/**
 * Fetches next social feed page is available.
 */
export const loadSocialFeedNextPage = () => async (dispatch, getState) => {
  const { social } = getState();
  const { currentPage, hasLastPageLoaded } = social;

  // Skip if currently loading or fully loaded.
  if (hasLastPageLoaded) {
    return;
  }

  const newPage = currentPage + 1;
  dispatch(fetchSocialFeed(newPage, false));
};

const fetchSocialFeed = (page = 0, shouldPrepend) => async (dispatch, getState, { api }) => {
  const { social } = getState();
  const { isLoading, latestFeedItemDate } = social;

  // Skip if currently loading or last page reached and not resetting
  if (isLoading) {
    return;
  }

  dispatch({ type: SOCIAL_FEED_REQUEST });

  try {
    const result = await api.getSocialFeed(page, shouldPrepend ? latestFeedItemDate : 0);
    const { items, pageNumber, hasMorePages } = result;

    dispatch({
      type: SOCIAL_FEED_SUCCESS,
      feedItems: items,
      currentPage: pageNumber,
      shouldPrependItems: shouldPrepend,
      hasMorePages,
    });
  } catch (error) {
    dispatch({
      type: SOCIAL_FEED_FAILURE,
      errorMessage: 'Currently offline, connect to the Internet to see latest activity',
    });
  }
};
