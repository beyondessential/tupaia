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

const getUserName = async (userId, models) => {
  try {
    const user = await models.user.findById(userId);
    return `${user.first_name} ${user.last_name} (${user.email} - ${user.id}), ${user.position} at ${user.employer}, `;
  } catch (error) {
    throw new DatabaseError('finding user', error);
  }
};

const sendRequest = (userName, countryNames, message, permissionGroup) => {
  const { COUNTRY_REQUEST_EMAIL_ADDRESS } = process.env;

  const emailText = `${userName} has requested access to countries:
    ${countryNames.join(',\n')}

    For the permission group: ${permissionGroup || 'not specified'}

    With the message:
    '${message}'
`;
  return sendEmail(COUNTRY_REQUEST_EMAIL_ADDRESS, 'Tupaia Country Access Request', emailText);
};

const createAccessRequests = async (userId, entities, message, permissionGroupId, models) => {
  for (const entity of entities) {
    await models.accessRequest.create({
      user_id: userId,
      entity_id: entity.id,
      message,
      permission_group_id: permissionGroupId,
    });
  }
};

// fetches entity using the provided ids, or via countries (supports meditrak 1.7.106 and older)
const fetchEntities = async (models, entityIds, countryIds) => {
  if (entityIds) return models.entity.find({ id: entityIds });
  const countries = await models.country.find({ id: countryIds });
  const entityCodes = countries.map(c => c.code);
  return models.entity.find({ code: entityCodes });
};

export const requestCountryAccess = async (req, res) => {
  const { body: requestBody = {}, userId: requestUserId, params, models } = req;
  const { countryIds, entityIds, message = '', userGroup } = requestBody;

  if ((!countryIds || countryIds.length === 0) && (!entityIds || entityIds.length === 0)) {
    throw new ValidationError('Please select at least one country.');
  }
  const entities = await fetchEntities(models, entityIds, countryIds);
  const userId = requestUserId || params.userId;

  try {
    checkUserPermission(req, userId);
  } catch (error) {
    throw new UnauthenticatedError(error.message);
  }
  const userName = await getUserName(userId, models);

  const permissionGroup = await models.permissionGroup.findOne({ name: userGroup });
  if (!permissionGroup) {
    throw new ValidationError(`Permission Group ${userGroup} does not exist`);
  }
  await createAccessRequests(userId, entities, message, permissionGroup.id, models);

  const countryNames = entities.map(e => e.name);
  await sendRequest(userName, countryNames, message, userGroup);

  respond(res, { message: 'Country access requested.' }, 200);
};
