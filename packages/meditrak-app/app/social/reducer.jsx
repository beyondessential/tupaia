import { createReducer } from '../utilities';
import {
  SOCIAL_FEED_REQUEST,
  SOCIAL_FEED_SUCCESS,
  SOCIAL_FEED_FAILURE,
  SOCIAL_FEED_RESET,
} from './constants';
import { arrayWithIdsToObject } from '../utilities/arrayWithIdsToObject';
import { LOGIN_REQUEST } from '../authentication';

const defaultState = {
  feedItems: [],
  isLoading: false,
  hasLastPageLoaded: false,
  errorMessage: '',
  currentPage: 0,
  latestFeedItemDate: 0,
};

const stateChanges = {
  [LOGIN_REQUEST]: () => ({
    currentPage: 0,
    feedItems: [],
    latestFeedItemDate: 0,
  }),
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
      const nonLeaderboardNewItems = newFeedItems.filter(item => item.type !== 'leaderboard');

      // If there are no new non-leaderboard items, do not prepend anything, otherwise prepend the new items
      if (nonLeaderboardNewItems.length > 0) {
        // If there are duplicate feed items in the current feed, remove them and
        // preference recent versions of them (eg to prevent duplicate leaderboards).
        const newItemsById = arrayWithIdsToObject(newFeedItems);
        const feedWithoutNewItems = feedItems.filter(item => !newItemsById[item.id]);

        feedItems = [...newFeedItems, ...feedWithoutNewItems];
      }
    } else {
      // dedupe new feed items to handle edge case where the same feed item appears twice in infinite scroll
      const dedupedNewFeedItems = newFeedItems.filter(
        item => !feedItems.some(existingItem => existingItem.id === item.id),
      );
      // By default append new items to the end of the existing ones.
      feedItems = [...feedItems, ...dedupedNewFeedItems];
    }

    // only grab the latest feed item date from non-leaderboard items, because the leaderboard will always be today's date
    const nonLeaderboardItems = feedItems.filter(item => item.type !== 'leaderboard');

    return {
      errorMessage: '',
      feedItems,
      isLoading: false,
      latestFeedItemDate: nonLeaderboardItems[0].creation_date,
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
  [SOCIAL_FEED_RESET]: () => ({
    currentPage: 0,
    feedItems: [],
    latestFeedItemDate: 0,
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
