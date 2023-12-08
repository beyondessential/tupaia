/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';
import { SOCIAL_FEED_REQUEST, SOCIAL_FEED_SUCCESS, SOCIAL_FEED_FAILURE } from './constants';
import { arrayWithIdsToObject } from '../utilities/arrayWithIdsToObject';

const defaultState = {
  feedItems: [],
  isLoading: false,
  hasLastPageLoaded: false,
  errorMessage: '',
  currentPage: 0,
  latestFeedItemDate: 0,
};

const stateChanges = {
  [SOCIAL_FEED_REQUEST]: () => ({
    isLoading: true,
  }),
  [SOCIAL_FEED_SUCCESS]: (
    { feedItems: newFeedItems, currentPage, hasMorePages, shouldPrependItems },
    state,
  ) => {
    let { feedItems } = state;

    // Currently cannot prepend more than 1 page into top of feed.
    const shouldReset = shouldPrependItems && hasMorePages;
    if (shouldReset) {
      feedItems = newFeedItems;
    } else if (shouldPrependItems) {
      // If there are duplicate feed items in the current feed, remove them and
      // preference recent versions of them (eg to prevent duplicate leaderboards).
      const newItemsById = arrayWithIdsToObject(newFeedItems);
      const feedWithoutNewItems = feedItems.filter(item => !newItemsById[item.id]);
      feedItems = [...newFeedItems, ...feedWithoutNewItems];
    } else {
      // By default append new items to the end of the existing ones.
      feedItems = [...feedItems, ...newFeedItems];
    }

    return {
      errorMessage: '',
      feedItems,
      isLoading: false,
      latestFeedItemDate: feedItems[0].creation_date,
      ...(shouldPrependItems && !shouldReset
        ? {}
        : {
            currentPage,
            hasLastPageLoaded: !hasMorePages,
          }),
    };
  },
  [SOCIAL_FEED_FAILURE]: ({ errorMessage }) => ({
    isLoading: false,
    errorMessage,
  }),
};

const onRehydrate = (incomingState, versionDidUpdate) => {
  if (!incomingState) return undefined;
  const incomingSocialState = incomingState.social;

  if (versionDidUpdate || !incomingSocialState || !incomingSocialState.feedItems) {
    return defaultState;
  }

  return incomingSocialState;
};

export const reducer = createReducer(defaultState, stateChanges, onRehydrate);
