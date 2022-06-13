/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */
import { respond, DatabaseError, UnauthenticatedError, ValidationError } from '@tupaia/utils';
import { getTokenClaimsFromBearerAuth } from '@tupaia/auth';
import { sendEmail } from '../utilities';

const checkUserPermission = (req, userId) => {
  const authHeader = req.headers.authorization;
  const tokenClaims = getTokenClaimsFromBearerAuth(authHeader);

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

const sendRequest = (userName, countryNames, message, project) => {
  const { COUNTRY_REQUEST_EMAIL_ADDRESS } = process.env;

  const emailText = `
${userName} has requested access to countries:
${countryNames.map(n => `  -  ${n}`).join('\n')}
${
  project
    ? `
For the project ${project.code} (linked to permission groups: ${project.permission_groups.join(
        ', ',
      )})
    `
    : ''
}
With the message: '${message}'
`;
  return sendEmail(COUNTRY_REQUEST_EMAIL_ADDRESS, 'Tupaia Country Access Request', emailText);
};

const createAccessRequests = async (models, userId, entities, message, project) => {
  // use the first permission group in the project's permission_groups as the placeholder permission group
  // that the access request administrator can choose to accept or change
  const [placeholderPermissionGroup] = project ? await project.permissionGroups() : [];
  await Promise.all(
    entities.map(async ({ id: entityId }) =>
      models.accessRequest.create({
        user_id: userId,
        entity_id: entityId,
        message,
        project_id: project ? project.id : null,
        permission_group_id: placeholderPermissionGroup ? placeholderPermissionGroup.id : null,
      }),
    ),
  );
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
  const { countryIds, entityIds, message = '', projectCode } = requestBody;

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

  const project = projectCode && (await models.project.findOne({ code: projectCode }));
  await createAccessRequests(models, userId, entities, message, project);

  const countryNames = entities.map(e => e.name);
  await sendRequest(userName, countryNames, message, project);

  respond(res, { message: 'Country access requested.' }, 200);
};
