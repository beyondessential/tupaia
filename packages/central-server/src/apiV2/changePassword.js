import { DatabaseError, FormValidationError, isValidPassword, respond } from '@tupaia/utils';
import { encryptPassword } from '@tupaia/auth';
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
  // TODO: Remove as part of RN-502
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
  } else if (!(await user.checkPassword(oldPassword))) {
    throw new FormValidationError('Incorrect current password', ['oldPassword']);
  }

  if (passwordParam !== passwordConfirmParam) {
    throw new FormValidationError('Passwords do not match', ['password', 'passwordConfirm']);
  }

  try {
    isValidPassword(passwordParam);
  } catch (error) {
    throw new FormValidationError(error.message, ['password', 'passwordConfirm']);
  }

  const newPasswordHash = await encryptPassword(passwordParam);
  await models.user.updateById(userId, {
    password_hash: newPasswordHash,
  });

  respond(res, { message: 'Password successfully updated' });
}
