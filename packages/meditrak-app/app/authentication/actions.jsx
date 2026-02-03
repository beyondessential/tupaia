import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import * as AppCenter from 'appcenter';

import { saltAndHash } from './saltAndHash';
import {
  EMAIL_ADDRESS_CHANGE,
  PASSWORD_CHANGE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
} from './constants';

import { resetToHome, resetToLogin, resetToWelcomeScreen } from '../navigation';

import { getErrorMessage } from '../sync/selectors';

const UNABLE_TO_CONNECT_MESSAGE = 'Unable to connect';

export const changeEmailAddress = emailAddress => ({
  type: EMAIL_ADDRESS_CHANGE,
  emailAddress,
});

export const changePassword = password => ({
  type: PASSWORD_CHANGE,
  password,
});

/**
 * Attempts to log in to server using credentials entered by user. If successful, begins a sync to
 * get the latest data (which may be all data if this is the first time the user has logged in)
 */
export const login =
  (emailAddress, password) =>
  async (dispatch, getState, { api, database, analytics }) => {
    dispatch(requestLogin());
    analytics.trackEvent('Request login');
    const installId = await AppCenter.getInstallId();

    const loginCredentials = {
      emailAddress,
      password,
      deviceName: await DeviceInfo.getDeviceName(),
      devicePlatform: Platform.OS,
      installId,
    };
    let response;
    try {
      response = await api.reauthenticate(loginCredentials);
      if (response.error) throw new Error(response.error);
    } catch (error) {
      if (
        error.message === 'Network request timed out' ||
        error.message === 'Network request failed' ||
        error.message === 'Network not connected'
      ) {
        dispatch(offlineLogin(emailAddress, password));
        return;
      }
      dispatch(receiveLoginError(error.message));
      return;
    }
    const passwordHash = saltAndHash(password);
    const user = database.updateUser({ emailAddress, passwordHash, ...response.user });

    dispatch(receiveLogin(emailAddress, user, user.accessPolicy, installId));
  };

export const offlineLogin =
  (emailAddress, password) =>
  (dispatch, getState, { database, analytics }) => {
    analytics.trackEvent('Request offline login');

    const user = database.getUser(emailAddress);
    if (user && saltAndHash(password) === user.passwordHash) {
      dispatch(receiveLogin(emailAddress, user, user.accessPolicy));
      analytics.trackEvent('Succeed offline login');
    } else {
      dispatch(receiveLoginError(UNABLE_TO_CONNECT_MESSAGE));
      analytics.trackEvent('Fail offline login');
    }
  };

export const requestLogin = () => ({
  type: LOGIN_REQUEST,
});

export const receiveLogin =
  (emailAddress, user, accessPolicy, installId) =>
  async (dispatch, getState, { database }) => {
    dispatch(resetToWelcomeScreen());

    const syncWasSuccessful = await database.synchronise(dispatch);
    const existingLoginDetails = database.getCurrentLoginDetails();
    // If sync failed and this is the first time the user has logged in, don't let them see the app
    if (!syncWasSuccessful && !existingLoginDetails.emailAddress) {
      const state = getState();
      const errorMessage = getErrorMessage(state);
      dispatch(receiveLoginError(`Sync failed: ${errorMessage}. Log in again to retry.`));
      dispatch(resetToLogin());
      return;
    }

    database.setCurrentLoginEmail(emailAddress);

    dispatch({
      type: LOGIN_SUCCESS,
      userId: user.id,
      name: user.name,
    });

    dispatch(resetToHome());
  };

export const receiveUpdatedAccessPolicy =
  userDetails =>
  (dispatch, getState, { database }) =>
    database.updateUser(userDetails);

export const receiveLoginError = errorMessage => ({
  type: LOGIN_FAILURE,
  errorMessage,
});

export const logout =
  () =>
  (dispatch, getState, { analytics }) => {
    dispatch(resetToLogin());
    dispatch({
      type: LOGOUT,
    });

    analytics.trackEvent('Log out');
  };

export const logoutWithError =
  errorMessage =>
  (dispatch, getState, { database }) => {
    database.clearCurrentUserSession();
    dispatch(logout());
    dispatch(receiveLoginError(errorMessage));
  };
