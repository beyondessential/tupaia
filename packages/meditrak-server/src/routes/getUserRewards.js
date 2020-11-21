/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { respond } from '@tupaia/utils';

export const getUserRewards = async (req, res) => {
  const { userId, models } = req;

  const rewards = await models.userReward.getRewardsForUser(userId);

  respond(res, rewards);
};
