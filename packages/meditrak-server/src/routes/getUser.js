/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseError } from '@tupaia/utils';
import { GETUserAccounts } from './userAccounts';

export const getUser = async (req, res, next) => {
  const { models, userId } = req;

  const user = await models.user.findById(userId);
  if (!user) {
    throw new DatabaseError('User not found');
  }

  try {
    req.params = {
      recordId: userId,
      resource: 'user',
    };
    const getUserAccountHandlerClass = new GETUserAccounts(req, res);
    await getUserAccountHandlerClass.handle();
  } catch (error) {
    next(error);
  }
};
