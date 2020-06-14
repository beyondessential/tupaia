/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/
import jwt from 'jsonwebtoken';

import { respond, DatabaseError, UnauthenticatedError, ValidationError } from '@tupaia/utils';
import { getJwtToken, sendEmail } from '../utilities';

const checkUserPermission = (req, userId) => {
  const authHeader = req.headers.authorization;
  const jwtToken = getJwtToken(authHeader);
  const tokenClaims = jwt.verify(jwtToken, process.env.JWT_SECRET);

  if (tokenClaims.userId !== userId) {
    throw new UnauthenticatedError('Permission to request access for given user is not available.');
  }
};

const mapCountryIdsToNames = async (countryIds, models) => {
  try {
    const countries = await Promise.all(
      countryIds.map(countryId => models.country.findById(countryId)),
    );

    return countries.map(country => `${country.name} (${country.id})`);
  } catch (error) {
    throw new DatabaseError('getting country names', error);
  }
};

const getUserName = async (userId, models) => {
  try {
    const user = await models.user.findById(userId);
    return `${user.first_name} ${user.last_name} (${user.email} - ${user.id}), ${user.position} at ${user.employer}, `;
  } catch (error) {
    throw new DatabaseError('finding user', error);
  }
};

const sendRequest = (userName, countryNames, message, userGroup) => {
  const { COUNTRY_REQUEST_EMAIL_ADDRESS } = process.env;

  const emailText = `${userName} has requested access to countries:
    ${countryNames.join(',\n')}

    For the permission group: ${userGroup || 'not specified'}

    With the message:
    '${message}'
`;
  return sendEmail(COUNTRY_REQUEST_EMAIL_ADDRESS, 'Tupaia Country Access Request', emailText);
};

const createAccessRequests = async (userId, countryIds, message, permissionGroupId, models) => {
  for (const countryId of countryIds) {
    await models.accessRequest.create({
      user_id: userId,
      country_id: countryId,
      message,
      permission_group_id: permissionGroupId,
    });
  }
};

export const requestCountryAccess = async (req, res) => {
  const { body: requestBody = {}, userId: requestUserId, params, models } = req;
  const { countryIds, message = '', userGroup } = requestBody;
  const userId = requestUserId || params.userId;

  if (!countryIds || countryIds.length === 0) {
    throw new ValidationError('Please select at least one country.');
  }

  try {
    checkUserPermission(req, userId);
  } catch (error) {
    throw new UnauthenticatedError(error.message);
  }
  const userName = await getUserName(userId, models);
  const countryNames = await mapCountryIdsToNames(countryIds, models);

  const permissionGroup = await models.permissionGroup.findOne({ name: userGroup });
  if (!permissionGroup) {
    throw new ValidationError(`Permission Group ${userGroup} does not exist`);
  }
  await createAccessRequests(userId, countryIds, message, permissionGroup.id, models);

  await sendRequest(userName, countryNames, message, userGroup);
  respond(res, { message: 'Country access requested.' }, 200);
};
