import { requireEnv, respond } from '@tupaia/utils';
import { sendEmail } from '@tupaia/server-utils';

const sendRequest = user => {
  const TUPAIA_ADMIN_EMAIL_ADDRESS = requireEnv('TUPAIA_ADMIN_EMAIL_ADDRESS');

  return sendEmail(TUPAIA_ADMIN_EMAIL_ADDRESS, {
    subject: 'Tupaia Account Deletion Request',
    templateName: 'deleteAccount',
    templateContext: {
      user,
    },
  });
};

export const deleteAccount = async (req, res) => {
  const { userId: requestUserId, params, models } = req;
  const userId = requestUserId || params.userId;
  const user = await models.user.findById(userId);
  await sendRequest(user);

  respond(res, { message: 'Account deletion requested.' }, 200);
};
