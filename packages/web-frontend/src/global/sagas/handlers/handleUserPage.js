import { put } from 'redux-saga/effects';
import {
  DIALOG_PAGE_ONE_TIME_LOGIN,
  openUserPage,
  setOverlayComponent,
  setPasswordResetToken,
  setVerifyEmailToken,
} from '../../../actions';
import { LANDING } from '../../../containers/OverlayDiv/constants';
import {
  PASSWORD_RESET_PREFIX,
  URL_COMPONENTS,
  VERIFY_EMAIL_PREFIX,
} from '../../../historyNavigation/constants';

export function* handleUserPage(userPage, initialComponents) {
  yield put(setOverlayComponent(LANDING));

  switch (userPage) {
    case PASSWORD_RESET_PREFIX:
      yield put(setPasswordResetToken(initialComponents[URL_COMPONENTS.PASSWORD_RESET_TOKEN]));
      yield put(openUserPage(DIALOG_PAGE_ONE_TIME_LOGIN));
      break;
    case VERIFY_EMAIL_PREFIX:
      yield put(setVerifyEmailToken(initialComponents[URL_COMPONENTS.VERIFY_EMAIL_TOKEN]));
      break;
    default:
      // eslint-disable-next-line no-console
      console.error('Unhandled user page', userPage);
  }
}
