import { put, takeLatest } from 'redux-saga/effects';
import {
  DIALOG_PAGE_RESET_PASSWORD,
  FETCH_RESET_TOKEN_LOGIN_SUCCESS,
  openUserPage,
} from '../../actions';

function* openResetPasswordDialog() {
  yield put(openUserPage(DIALOG_PAGE_RESET_PASSWORD));
}

export function* watchFetchResetTokenLoginSuccess() {
  // TODO:
  // After #770 is done, this chaining would be better suited to something like a 'redirectTo' after login argument
  // which would take you to the url of this dialog page. For now, we need to call an action to display it
  yield takeLatest(FETCH_RESET_TOKEN_LOGIN_SUCCESS, openResetPasswordDialog);
}
