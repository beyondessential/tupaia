/**
 * Tupaia MediTrak
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { respond } from '@tupaia/utils';
import { sendEmail } from '../utilities';
import { getUserInfoInString } from './utilities';

const sendRequest = userName => {
  const { TUPAIA_ADMIN_EMAIL_ADDRESS } = process.env;

  const emailText = `${userName} has requested to delete his/her account`;
  return sendEmail(TUPAIA_ADMIN_EMAIL_ADDRESS, 'Tupaia Account Deletion Request', emailText);
};

export const deleteAccount = async (req, res) => {
  const { userId: requestUserId, params, models } = req;
  const userId = requestUserId || params.userId;
  const userName = await getUserInfoInString(userId, models);
  await sendRequest(userName);

  respond(res, { message: 'Account deletion requested.' }, 200);
};
