/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { respond, FormValidationError, DatabaseError, isValidPassword } from '@tupaia/utils';
import { hashAndSaltPassword, checkPassword } from '@tupaia/auth';
import { allowNoPermissions } from '../permissions';

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

  // Checking the oneTimeLogin/oldPassword acts as our permission check
  await req.assertPermissions(allowNoPermissions);

  // Support both alternatives so that users using versions
  // of meditrak-app prior to 1.9.109 can still change their passwords
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
  } else if (!checkPassword(oldPassword, user.password_salt, user.password_hash)) {
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

  await models.user.updateById(userId, {
    ...hashAndSaltPassword(passwordParam),
  });

  respond(res, { message: 'Successfully updated password' });
}
