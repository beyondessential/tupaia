/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { DatabaseError } from '@tupaia/utils';
import { editRecord } from './editRecord';

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
    await editRecord(req, res);
  } catch (error) {
    next(error);
  }
}
