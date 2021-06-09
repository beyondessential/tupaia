import {} from 'dotenv/config'; // Load the environment variables into process.env
import session from 'client-sessions';

import { UnauthenticatedError } from '@tupaia/utils';

import { getUserFromAuthHeader } from './getUserFromAuthHeader';
import { getAccessPolicyForUser } from './getAccessPolicyForUser';
import { PUBLIC_USER_NAME } from './publicAccess';

const allowedUnauthRoutes = ['/login', '/version'];

// auth is a middleware that runs on every request
const auth = () => async (req, res, next) => {
  const { authenticator } = req;

  try {
    // if using basic or bearer auth, check credentials and set access policy for that user
    const authHeaderUser = await getUserFromAuthHeader(req);
    if (authHeaderUser) {
      req.accessPolicy = await getAccessPolicyForUser(authenticator, authHeaderUser.id);
      next();
      return;
    }

    // if logged in or logging in continue
    const userId = req.session?.userJson?.userId;
    if (!!userId || checkAllowedUnauthRoutes(req)) {
      req.accessPolicy = req.accessPolicy || (await getAccessPolicyForUser(authenticator, userId));
      next();
      return;
    }

    // check if this is the first request after user logged out and send 440
    if (req.lastuser?.userName && req.lastuser?.userName !== PUBLIC_USER_NAME) {
      req.lastuser.reset();
      res.sendStatus(440);
      return;
    }

    // no previous login, authenticate as public user
    setSession(req, { userName: PUBLIC_USER_NAME }); // store new session as public user
    req.accessPolicy = await getAccessPolicyForUser(authenticator, PUBLIC_USER_NAME);
  } catch (error) {
    next(new UnauthenticatedError(error.message));
  }
  next();
};

const checkAllowedUnauthRoutes = req =>
  allowedUnauthRoutes.some(allowedRoute => req.originalUrl.endsWith(allowedRoute));

export const setSession = (req, userInfo) => {
  req.accessPolicy = null; // reset access policy cache so it is rebuilt
  req.session = { userJson: { ...userInfo } };
  req.lastuser = { userName: userInfo.userName };
};

const addUserAccessHelper = (req, res, next) => {
  req.userHasAccess = async (entityOrCode, permissionGroup = '') => {
    const { accessPolicy } = req;
    if (!accessPolicy) {
      return false;
    }

    const entity =
      typeof entityOrCode === 'string'
        ? await req.models.entity.findOne({
            code: entityOrCode,
          })
        : entityOrCode;

    // Assume user always has access to all world items.
    if (entity.code === 'World') {
      return true;
    }
    // Timor-Leste is temporarily turned off
    if (entity.country_code === 'TL') {
      return false;
    }

    // project access rights are determined by their children
    if (entity.isProject()) {
      const project = await req.models.project.findOne({ code: entity.code });
      const projectChildren = await entity.getChildren(project.entity_hierarchy_id);

      return accessPolicy.allowsSome(
        projectChildren.map(c => c.country_code),
        permissionGroup,
      );
    }

    return accessPolicy.allows(entity.country_code, permissionGroup);
  };

  req.getUserGroups = async entityCode => {
    if (entityCode === 'World') {
      return ['Public']; // At this stage, all users have Public access to the World dashboard
    }

    const { accessPolicy } = req;
    if (!accessPolicy) {
      return [];
    }

    const entity = await req.models.entity.findOne({
      code: entityCode,
    });

    // project access rights are determined by their children
    if (entity.isProject()) {
      const project = await req.models.project.findOne({ code: entity.code });
      const projectChildren = await entity.getChildren(project.entity_hierarchy_id);
      return accessPolicy.getPermissionGroups([
        ...new Set(projectChildren.map(c => c.country_code)),
      ]);
    }

    return accessPolicy.getPermissionGroups([entity.country_code]);
  };
  next();
};
const USER_SESSION_COOKIE_TIMEOUT = 24 * 60 * 60 * 1000;
const LAST_USER_SESSION_COOKIE_TIMEOUT = 7 * 24 * 60 * 60 * 1000;

export const USER_SESSION_CONFIG = {
  cookieName: 'sessionV2', // changed name to ignore old sessions after access policy refactor
  requestKey: 'session', // use it as `req.session` rather than `req.sessionV2`
  secret: process.env.USER_SESSION_COOKIE_SECRET,
  secure: false,
  httpOnly: false,
  duration: USER_SESSION_COOKIE_TIMEOUT,
  activeDuration: USER_SESSION_COOKIE_TIMEOUT,
};

const LAST_USER_SESSION_CONFIG = {
  cookieName: 'lastuser',
  secret: process.env.LAST_USER_SESSION_COOKIE_SECRET,
  secure: false,
  httpOnly: false,
  duration: LAST_USER_SESSION_COOKIE_TIMEOUT,
};

export const bindUserSessions = app => {
  // main session
  app.use(session(USER_SESSION_CONFIG));
  // session to keep track of last user, use to figure out if
  // 440 - session expired needs to be sent
  app.use(session(LAST_USER_SESSION_CONFIG));
  app.use(addUserAccessHelper);

  app.use(auth());
};
