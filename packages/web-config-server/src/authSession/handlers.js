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

export const oneTimeLogin = async (req, res) => {
  await authenticateUsingMethod(req, res, 'authenticateOneTimeLogin');
};
