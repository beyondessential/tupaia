/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { respond } from '@tupaia/utils';
import { getRewardsForUser } from '../../social';

// TODO: Remove as part of RN-502
export const getUserRewards = async (req, res) => {
  const { userId, models, query } = req;

  const { coconuts, pigs } = await getRewardsForUser(models.database, userId, query?.projectId);

  respond(res, { coconuts, pigs });
};
