import {} from 'dotenv/config'; // Load the environment variables into process.env
import session from 'client-sessions';

import { getAccessPolicyForUser } from './getAccessPolicyForUser';
import { PUBLIC_USER_NAME } from './publicAccess';
import { Entity, Project } from '/models';

const allowedUnauthRoutes = ['/login', '/version'];

// auth is a middleware that runs on every request
const auth = () => (req, res, next) => {
  if (
    (req.session && req.session.userJson && req.session.userJson.userName) ||
    checkAllowedUnauthRoutes(req)
  ) {
    // if logged in or loggin in continue
    next();
    // else check if this is the first request after user logged out
    // and send 440 or authenticate as public user
  } else if (req.lastuser && req.lastuser.userName && req.lastuser.userName !== PUBLIC_USER_NAME) {
    req.lastuser.reset();
    res.sendStatus(440);
  } else {
    authPublicUser(req, res, next);
  }
};

const authPublicUser = (req, res, next) => {
  setSession(req, { userName: PUBLIC_USER_NAME }); // store new session as public user
  next();
};

const checkAllowedUnauthRoutes = req =>
  allowedUnauthRoutes.some(allowedRoute => req.originalUrl.endsWith(allowedRoute));

const getUserAccessPolicyFromSession = async req => {
  if (!req.accessPolicy) {
    const { userName } = req.session.userJson;
    req.accessPolicy = getAccessPolicyForUser(userName);
  }
  return req.accessPolicy;
};

export const setSession = (req, userInfo) => {
  req.accessPolicy = null; // reset access policy cache so it is rebuilt
  req.session = { userJson: { ...userInfo } };
  req.lastuser = { userName: userInfo.userName };
};

const addUserAccessHelper = (req, res, next) => {
  req.userHasAccess = async (entityOrCode, permissionGroup = '') => {
    const accessPolicy = await getUserAccessPolicyFromSession(req);
    if (!accessPolicy) {
      return false;
    }

    const entity =
      typeof entityOrCode === 'string'
        ? await Entity.findOne({
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
      const project = await Project.findOne({ code: entity.code });
      const projectChildren = await entity.getChildren(project.entity_hierarchy_id);
      const accessByChildrenPromises = projectChildren.map(childCode =>
        req.userHasAccess(childCode, permissionGroup),
      );

      return (await Promise.all(accessByChildrenPromises)).some(hasAccess => hasAccess);
    }

    return accessPolicy.allows(entity.country_code, permissionGroup);
  };

  req.getUserGroups = async entityCode => {
    if (entityCode === 'World') {
      return ['Public']; // At this stage, all users have Public access to the World dashboard
    }

    const accessPolicy = await getUserAccessPolicyFromSession(req);
    if (!accessPolicy) {
      return [];
    }

    const entity = await Entity.findOne({
      code: entityCode,
    });

    // project access rights are determined by their children
    if (entity.isProject()) {
      const project = await Project.findOne({ code: entity.code });
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
