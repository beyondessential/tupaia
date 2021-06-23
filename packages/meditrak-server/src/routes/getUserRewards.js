/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { respond } from '@tupaia/utils';
import { getRewardsForUser } from '../social';

export const getUserRewards = async (req, res) => {
  const { userId, models } = req;

  const { coconuts, pigs } = await getRewardsForUser(models.database, userId);

  respond(res, { coconuts, pigs });
};
