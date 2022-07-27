import { call, put, takeLatest } from 'redux-saga/effects';
import {
  ATTEMPT_RESET_TOKEN_LOGIN,
  fetchResetTokenLoginError,
  fetchResetTokenLoginSuccess,
  findLoggedIn,
} from '../../../actions';
import { LOGIN_TYPES } from '../../../constants';
import { request } from '../../../utils';

function* attemptTokenLogin(action) {
  const { passwordResetToken } = action;
  const body = {
    token: passwordResetToken,
  };

  const fetchOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  const requestContext = {
    alwaysUseSuppliedErrorFunction: true,
  };

  const requestResourceUrl = 'login/oneTimeLogin';
  try {
    yield call(
      request,
      requestResourceUrl,
      fetchResetTokenLoginError,
      fetchOptions,
      requestContext,
      false,
    );

    yield put(findLoggedIn(LOGIN_TYPES.TOKEN, true)); // default to email verified for one time login to prevent a nag screen
    yield put(fetchResetTokenLoginSuccess());
  } catch (error) {
    yield put(error.errorFunction(error));
  }
}

export function* watchAttemptTokenLogin() {
  yield takeLatest(ATTEMPT_RESET_TOKEN_LOGIN, attemptTokenLogin);
}
