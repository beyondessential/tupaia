import { FormValidationError, respond, UnverifiedError } from '@tupaia/utils';
import { allowNoPermissions } from '../permissions';
import {
  sendEmailVerification,
  VerificationTokenInvalidError,
  verifyEmailHelper,
} from './utilities/emailVerification';

/**
 * Endpoint handler for verifying user email
 */
export const verifyEmail = async (req, res) => {
  const { models } = req;
  const { token } = req.body;
  const { UNVERIFIED, NEW_USER, VERIFIED } = models.user.emailVerifiedStatuses;

  await req.assertPermissions(allowNoPermissions);

  try {
    // Search unverified emails first. If we don’t find any try for emails already verified so we
    // don’t pass an error back if the user clicks the link twice
    const verifiedUser =
      (await verifyEmailHelper(models, [UNVERIFIED, NEW_USER], token)) ??
      (await verifyEmailHelper(models, VERIFIED, token));

    if (verifiedUser) {
      verifiedUser.verified_email = VERIFIED;
      await models.user.updateById(verifiedUser.id, verifiedUser);

      respond(res, { emailVerified: 'true' });
    } else {
      // Our tokens don’t actually have expiry, but are invalidated if their password changes
      throw new UnverifiedError(
        'Couldn’t verify your email. Your link may have expired; please request a new one.',
      );
    }
  } catch (e) {
    if (e instanceof VerificationTokenInvalidError) {
      throw new UnverifiedError('Verification link is invalid. Please request a new one.');
    }
    throw e;
  }
};

/**
 * Endpoint handler for when a user requests another verification email
 */
export const requestResendEmail = async (req, res) => {
  const { body, models } = req;
  const { emailAddress } = body;

  await req.assertPermissions(allowNoPermissions);

  if (!emailAddress) {
    throw new FormValidationError('No email address provided', ['emailAddress']);
  }

  const user = await models.user.findOne({
    email: emailAddress,
  });

  // if the user doesn't exist or the email address has already been verified do not give the user any extra information
  if (!user || user.checkIsEmailVerified()) {
    throw new FormValidationError(`Unable to send verification email to ${emailAddress}`);
  }

  sendEmailVerification(user);
  respond(res, {
    success: true,
  });
};
