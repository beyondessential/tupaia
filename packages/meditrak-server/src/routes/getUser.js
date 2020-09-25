/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseError, respond } from '@tupaia/utils';

export const getUser = async (req, res) => {
  const { models, userId } = req;

  const user = await models.user.findById(userId);
  if (!user) {
    throw new DatabaseError('User not found');
  }

  respond(res, user);
};
