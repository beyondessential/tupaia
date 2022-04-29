/**
 * Tupaia MediTrak
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { respond, DatabaseError } from '@tupaia/utils';
import { sendEmail } from '../utilities';

const getUserName = async (userId, models) => {
  try {
    const user = await models.user.findById(userId);
    return `${user.first_name} ${user.last_name} (${user.email} - ${user.id}), ${user.position} at ${user.employer}, `;
  } catch (error) {
    throw new DatabaseError('finding user', error);
  }
};

const sendRequest = userName => {
  const { TUPAIA_ADMIN_EMAIL_ADDRESS } = process.env;

  const emailText = `${userName} has requested to delete his/her account`;
  return sendEmail(TUPAIA_ADMIN_EMAIL_ADDRESS, 'Tupaia Account Deletion Request', emailText);
};

export const deleteMyAccount = async (req, res) => {
  const { userId: requestUserId, params, models } = req;
  const userId = requestUserId || params.userId;
  const userName = await getUserName(userId, models);
  await sendRequest(userName);

  respond(res, { message: 'Account deletion requested.' }, 200);
};
