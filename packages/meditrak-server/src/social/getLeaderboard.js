/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

export const getLeaderboard = async (models, rowCount = 10) => {
  const entireLeaderboard = await models.userReward.getLeaderboard();
  return entireLeaderboard.slice(0, rowCount);
};
