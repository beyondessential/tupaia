/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { DatabaseError } from '@tupaia/utils';
import { EditUserAccounts } from './userAccounts';

export async function editUser(req, res, next) {
  const { models, userId } = req;

  const user = await models.user.findById(userId);
  if (!user) {
    throw new DatabaseError('User not found');
  }

  try {
    req.params = {
      id: userId,
      resource: 'user',
    };
    const editUserAccountHandlerClass = new EditUserAccounts(req, res);
    await editUserAccountHandlerClass.handle();
  } catch (error) {
    next(error);
  }
}
