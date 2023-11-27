/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

const isTupaiaServerUser = async models => {
  return models.user.findOne({ first_name: 'TUPAIA', last_name: 'Server' });
};

export const assertIsOwnEmail = async (userId, models, dashboardMailingListEmail) => {
  const user = await models.user.findById(userId);

  // A user who is not logged in will have user_account record of Tupaia Server.
  if (!isTupaiaServerUser(models) && user.email !== dashboardMailingListEmail) {
    throw new Error(`Dashboard mailing list entry must belong to user`);
  }

  return true;
};
