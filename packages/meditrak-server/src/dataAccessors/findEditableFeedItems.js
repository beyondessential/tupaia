/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

export const findEditableFeedItems = async (models, criteria = {}, options = {}) =>
  models.feedItem.find(
    {
      ...criteria,
      type: 'markdown',
    },
    options,
  );
