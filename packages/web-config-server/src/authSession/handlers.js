/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { setSession } from './authSession';
import { TUPAIA_CONFIG_SERVER_DEVICE_NAME } from './constants';

const respondWithError = (res, errorMessage) => {
  res.status(401).send({ error: errorMessage });
};

const processLogin = (sessionDetails, req, res) => {
  setSession(req, sessionDetails); // store new session
  res.send({
    authenticated: true,
    name: req.session.userJson.name,
    defaultOrganisationUnit: req.session.userJson.defaultOrganisationUnit,
    emailVerified: req.session.userJson.verifiedEmail,
  });
};

const authenticateUsingMethod = async (req, res, authenticationMethod) => {
  const { authenticator, body, models } = req;
  try {
    const { user, accessPolicy, refreshToken } = await authenticator[authenticationMethod]({
      ...body,
      deviceName: TUPAIA_CONFIG_SERVER_DEVICE_NAME,
    });
    const { id: userId, fullName: userName, email, verified_email: verifiedEmail } = user;
    await models.userSession.updateOrCreate({ userName }, { accessPolicy, refreshToken }); // Save tokens for user
    processLogin(
      {
        userId,
        userName,
        email,
        verifiedEmail,
      },
      req,
      res,
    );
  } catch (error) {
    respondWithError(res, error.message);
  }
};

export const login = async (req, res) => {
  await authenticateUsingMethod(req, res, 'authenticatePassword');
};

export const oneTimeLogin = async (req, res) => {
  await authenticateUsingMethod(req, res, 'authenticateOneTimeLogin');
};

export const logout = (req, res) => {
  if (req.session && req.session.userJson && req.session.userJson.userName) req.session.reset();
  if (req.lastuser && req.lastuser.userName) req.lastuser.reset();
  res.send({ loggedout: true });
};
