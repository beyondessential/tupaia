/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

export const assertIsOwnEmail = async (userId, models, dashboardMailingListEmail) => {
  const user = await models.user.findById(userId);
  if (user.email !== dashboardMailingListEmail) {
    throw new Error(`Dashboard mailing list entry must belong to user`);
  }

  return true;
};
