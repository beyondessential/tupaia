import { respond, DatabaseError, FormValidationError, requireEnv } from '@tupaia/utils';
import { sendEmail } from '@tupaia/server-utils';
import { allowNoPermissions } from '../permissions';

export const requestPasswordReset = async (req, res) => {
  const { body, models } = req;
  const { emailAddress, resetPasswordUrl } = body;

  await req.assertPermissions(allowNoPermissions);

  if (!emailAddress) {
    throw new FormValidationError('No email address provided', ['emailAddress']);
  }

  const user = await models.user.findOne({
    email: emailAddress,
  });

  if (!user) {
    throw new DatabaseError(`No account with the email ${emailAddress} found`);
  }

  const { token } = await models.oneTimeLogin.create({
    user_id: user.id,
  });

  const TUPAIA_FRONT_END_URL = requireEnv('TUPAIA_FRONT_END_URL');
  // allow overriding the default url for the front end, so that this route can be used from Tupaia and also datatrak
  const passwordResetUrl = `${
    resetPasswordUrl || TUPAIA_FRONT_END_URL
  }/reset-password?passwordResetToken={token}`;
  const resetUrl = passwordResetUrl.replace('{token}', token);

  sendEmail(user.email, {
    subject: 'Password reset on Tupaia.org',
    templateName: 'passwordReset',
    templateContext: {
      userName: user.first_name,
      cta: {
        text: 'Reset your password',
        url: resetUrl,
      },
    },
  });

  respond(res, {
    success: true,
  });
};
