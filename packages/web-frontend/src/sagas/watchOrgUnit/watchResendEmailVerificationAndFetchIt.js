import { call, put, takeLatest } from 'redux-saga/effects';
import {
  fetchResendEmailError,
  FETCH_RESEND_VERIFICATION_EMAIL,
  openResendEmailSuccess,
} from '../../actions';
import { request } from '../../utils';

function* resendVerificationEmail(action) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emailAddress: action.email }),
  };

  const requestResourceUrl = 'resendEmail';
  try {
    yield call(request, requestResourceUrl, fetchResendEmailError, options);
    yield put(openResendEmailSuccess());
  } catch (error) {
    const errorMessage = error.response ? yield error.response.json() : {};
    yield put(fetchResendEmailError(errorMessage.details ? errorMessage.details : ''));
  }
}

export function* watchResendEmailVerificationAndFetchIt() {
  yield takeLatest(FETCH_RESEND_VERIFICATION_EMAIL, resendVerificationEmail);
}
