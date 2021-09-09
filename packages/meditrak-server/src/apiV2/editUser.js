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
    const editUserAccountHandlerClass = new EditUserAccounts(
      {
        ...req,
        path: '/users',
        params: {
          recordId: userId,
        },
      },
      res,
    );
    await editUserAccountHandlerClass.handle();
  } catch (error) {
    next(error);
  }
}
