import {
  EMAIL_ADDRESS_CHANGE,
  REMEMBER_ME_CHANGE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT,
  PROFILE_SUCCESS,
} from './constants';

export const changeEmailAddress = emailAddress => ({
  type: EMAIL_ADDRESS_CHANGE,
  emailAddress,
});

export const changeRememberMe = rememberMe => ({
  type: REMEMBER_ME_CHANGE,
  rememberMe,
});

export const login =
  (emailAddress, password) =>
  async (dispatch, getState, { api }) => {
    const deviceName = window.navigator.userAgent;
    dispatch({
      // Set state to logging in
      type: LOGIN_REQUEST,
    });
    try {
      const userDetails = await api.post({
        emailAddress,
        password,
        deviceName,
      });
      dispatch(loginSuccess(userDetails));
    } catch (error) {
      dispatch(loginError(error.message));
    }
  };

export const loginSuccess =
  ({ user }) =>
  dispatch => {
    dispatch({
      type: LOGIN_SUCCESS,
      user,
    });
  };

export const loginError = errorMessage => ({
  type: LOGIN_ERROR,
  errorMessage,
});

export const logout =
  (errorMessage = null) =>
  async (dispatch, getState, { api }) => {
    dispatch({
      // Set state to logging out
      type: LOGOUT,
      errorMessage,
    });

    await api.logout();
  };

// Profile
export const updateProfile =
  payload =>
  async (dispatch, getState, { api }) => {
    await api.put(`me`, null, payload);
    const { body: user } = await api.get(`me`);
    dispatch({
      type: PROFILE_SUCCESS,
      ...user,
    });
  };

// Password
export const updatePassword =
  payload =>
  async (dispatch, getState, { api }) =>
    api.post(`me/changePassword`, null, payload);
