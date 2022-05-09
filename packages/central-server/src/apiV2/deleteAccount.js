/**
 * Tupaia MediTrak
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */
import { respond } from '@tupaia/utils';
import { sendEmail } from '../utilities';
import { getUserInfoInString } from './utilities';

const sendRequest = userInfo => {
  const { TUPAIA_ADMIN_EMAIL_ADDRESS } = process.env;

  const emailText = `${userInfo} has requested to delete their account`;
  return sendEmail(TUPAIA_ADMIN_EMAIL_ADDRESS, 'Tupaia Account Deletion Request', emailText);
};

export const deleteAccount = async (req, res) => {
  const { userId: requestUserId, params, models } = req;
  const userId = requestUserId || params.userId;
  const userInfo = await getUserInfoInString(userId, models);
  await sendRequest(userInfo);

  respond(res, { message: 'Account deletion requested.' }, 200);
};
