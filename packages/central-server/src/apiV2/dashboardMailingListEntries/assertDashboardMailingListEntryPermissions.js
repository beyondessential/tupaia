export const assertIsOwnEmail = async (userId, models, dashboardMailingListEmail) => {
  const user = await models.user.findById(userId);

  // A user who is not logged in will have user_account record of Tupaia Server.
  if (user.email !== dashboardMailingListEmail) {
    throw new Error(`Dashboard mailing list entry must belong to user`);
  }

  return true;
};
