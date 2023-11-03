/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { connect } from 'react-redux';

import { LoginPage } from './LoginPage';
import { changeEmailAddress, changePassword, login } from './actions';
import { goToCreateAccount } from '../navigation/actions';
import { AUTH_STATUSES } from './constants';

const { AUTHENTICATING, UNAUTHENTICATED, ERROR } = AUTH_STATUSES;

/**
 * Determines whether user is able to press the log in button
 */
function getCanAttemptLogin(authStatus, emailAddress, password) {
  return (
    (authStatus === UNAUTHENTICATED || authStatus === ERROR) && // Not authenticating
    emailAddress.length > 0 && // Something entered in emailAddress field
    password.length > 0 // Something entered in password field
  );
}

/**
 * Determines what label is displayed in the login button
 */
function getLoginButtonText(authStatus) {
  switch (authStatus) {
    case AUTHENTICATING:
      return 'Logging in';
    case UNAUTHENTICATED:
    default:
      return 'Log In';
  }
}

function mapStateToProps({ authentication }) {
  const { status, emailAddress, password, errorMessage } = authentication;
  return {
    errorMessage,
    loginButtonText: getLoginButtonText(status, errorMessage),
    loginButtonIsEnabled: getCanAttemptLogin(status, emailAddress, password),
    fieldsAreEditable: status !== AUTHENTICATING,
    emailAddress,
    password,
    isLoggingIn: status === AUTHENTICATING,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onLogin: (emailAddress, password) => dispatch(login(emailAddress, password)),
    onChangeEmailAddress: newEmailAddress => dispatch(changeEmailAddress(newEmailAddress)),
    onChangePassword: newPassword => dispatch(changePassword(newPassword)),
    onCreateAccount: () => dispatch(goToCreateAccount()),
  };
}

const LoginContainer = connect(mapStateToProps, mapDispatchToProps)(LoginPage);

export { LoginContainer };
