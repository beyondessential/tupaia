import { requireEnv, respond, UnauthenticatedError, ValidationError } from '@tupaia/utils';
import { sendEmail } from '@tupaia/server-utils';
import { getTokenClaimsFromBearerAuth } from '@tupaia/auth';

const checkUserPermission = (req, userId) => {
  const authHeader = req.headers.authorization;
  const tokenClaims = getTokenClaimsFromBearerAuth(authHeader);

  if (tokenClaims.userId !== userId) {
    throw new UnauthenticatedError('Permission to request access for given user is not available.');
  }
};

const sendRequest = async (userId, models, countries, message, project) => {
  const user = await models.user.findById(userId);

  const TUPAIA_ADMIN_EMAIL_ADDRESS = requireEnv('TUPAIA_ADMIN_EMAIL_ADDRESS');

  return sendEmail(TUPAIA_ADMIN_EMAIL_ADDRESS, {
    subject: 'Tupaia Country Access Request',
    templateName: 'requestCountryAccess',
    templateContext: {
      title: 'You have a new country request!',
      cta: {
        url: `${process.env.ADMIN_PANEL_FRONT_END_URL}/users/access-requests/${userId}`,
        text: 'Approve or deny request',
      },
      countries,
      message,
      project: project
        ? {
            code: project.code,
            permissionGroups: project.permission_groups.join(', '),
          }
        : null,
      user,
    },
  });
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
  if (entityIds) return models.entity.findManyById(entityIds);
  const countries = await models.country.findManyById(countryIds);
  const entityCodes = countries.map(c => c.code);
  return await models.entity.find({ code: entityCodes });
};

export const requestCountryAccess = async (req, res) => {
  const { body: requestBody = {}, userId, models } = req;
  const { countryIds, entityIds, message = '', projectCode } = requestBody;

  if ((!countryIds || countryIds.length === 0) && (!entityIds || entityIds.length === 0)) {
    throw new ValidationError('Please select at least one country');
  }
  const entities = await fetchEntities(models, entityIds, countryIds);

  try {
    checkUserPermission(req, userId);
  } catch (error) {
    throw new UnauthenticatedError(error.message);
  }

  const project = projectCode && (await models.project.findOne({ code: projectCode }));
  await createAccessRequests(models, userId, entities, message, project);

  const countryNames = entities.map(e => e.name);
  await sendRequest(userId, models, countryNames, message, project);

  respond(res, { message: 'Country access requested' }, 200);
};
