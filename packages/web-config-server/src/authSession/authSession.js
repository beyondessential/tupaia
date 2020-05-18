import {} from 'dotenv/config'; // Load the environment variables into process.env
import session from 'client-sessions';
import {
  hasReportAccessToOrganisationUnit,
  getReportUserGroupAccessRightsForOrganisationUnit,
} from '/apiV1/utils';
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
  const userName = req.session.userJson.userName;
  return getAccessPolicyForUser(userName);
};

export const setSession = (req, userInfo) => {
  req.session = { userJson: { ...userInfo } };
  req.lastuser = { userName: userInfo.userName };
};

export const addUserAccessHelper = (req, res, next) => {
  req.userHasAccess = async (entityOrCode, userGroup = '') => {
    const entity =
      typeof entityOrCode === 'string'
        ? await Entity.findOne({ code: entityOrCode })
        : entityOrCode;

    // Assume user always has access to all world items.
    if (entity.code === 'World') {
      return true;
    }

    const accessPolicy = await getUserAccessPolicyFromSession(req);
    if (!accessPolicy) {
      return false;
    }

    const ancestorCodes = await entity.getAncestorCodes();

    return hasReportAccessToOrganisationUnit(accessPolicy, entity.code, ancestorCodes, userGroup);
  };

  req.getUserGroupAccessRights = async entityCode => {
    const accessPolicy = await getUserAccessPolicyFromSession(req);
    if (!accessPolicy) {
      return {};
    }

    const entity = await Entity.findOne({ code: entityCode });
    const ancestorCodes = await entity.getAncestorCodes();

    return getReportUserGroupAccessRightsForOrganisationUnit(
      accessPolicy,
      entityCode,
      ancestorCodes,
    );
  };

  req.getUserGroups = async entityCode => {
    if (entityCode === 'World' || entityCode === 'explore') {
      return ['Public']; // At this stage, all users have Public access to the World and explore project dashboards
    }

    const entity = await Entity.findOne({ code: entityCode });
    if (entity.isProject()) {
      const project = await Project.findOne({ code: entity.code });
      const projectChildren = await entity.getChildren(project.entity_hierarchy_id);

      const projectAccessRights = [];
      for (const entity of projectChildren) {
        const userGroupAccessRights = await req.getUserGroupAccessRights(entity.code);

        Object.keys(userGroupAccessRights).forEach(
          userGroup =>
            userGroupAccessRights[userGroup] === true && projectAccessRights.push(userGroup),
        );
      }
      return [...new Set(projectAccessRights)];
    }

    const userGroupAccessRights = await req.getUserGroupAccessRights(entityCode);
    return Object.keys(userGroupAccessRights).filter(
      userGroup => userGroupAccessRights[userGroup] === true,
    );
  };

  next();
};

const USER_SESSION_COOKIE_TIMEOUT = 24 * 60 * 60 * 1000;
const LAST_USER_SESSION_COOKIE_TIMEOUT = 7 * 24 * 60 * 60 * 1000;

export const USER_SESSION_CONFIG = {
  cookieName: 'session',
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
