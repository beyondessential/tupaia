/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { FormValidationError, DatabaseError, isValidPassword } from '@tupaia/utils';
import { editRecord } from './editRecord';

export async function changePassword(req, res, next) {
  const { models, body, userId } = req;
  const {
    oneTimeLoginToken,
    oldPassword,
    password,
    newPassword,
    passwordConfirm,
    newPasswordConfirm,
  } = body;

  // Support both alternatives so that users using old versions
  // of meditrak-app can still change their passwords
  const passwordParam = password || newPassword;
  const passwordConfirmParam = passwordConfirm || newPasswordConfirm;

  // Check password hash matches that in db
  const user = await models.user.findById(userId);
  if (!user) {
    throw new DatabaseError('User not found');
  }

  // Allow users to change password using a one time login instead of their old password as
  // long as the token is used but not expired.
  if (oneTimeLoginToken) {
    const isTokenValid = await models.oneTimeLogin.isTokenValid(oneTimeLoginToken, userId, true);
    if (!isTokenValid) {
      throw new FormValidationError('One time login is invalid');
    }
  } else if (!user.checkPassword(oldPassword)) {
    throw new FormValidationError('Incorrect current password.', ['oldPassword']);
  }

  if (passwordParam !== passwordConfirmParam) {
    throw new FormValidationError('Passwords do not match.', ['password', 'passwordConfirm']);
  }

  try {
    isValidPassword(passwordParam);
  } catch (error) {
    throw new FormValidationError(error.message, ['password', 'passwordConfirm']);
  }

  try {
    req.params = {
      id: userId,
      resource: 'user',
    };
    req.body = {
      password: passwordParam,
    };

    await editRecord(req, res);
  } catch (error) {
    next(error);
  }
}
