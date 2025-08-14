import { connect } from 'react-redux';
import { fetch as fetchNetInfo } from '@react-native-community/netinfo';
import { LoginPage } from './LoginPage';
import { changeEmailAddress, changePassword, login } from './actions';
import { goToCreateAccount, loadWebsite, navigateToScreen } from '../navigation/actions';
import { AUTH_STATUSES } from './constants';
import { NO_INTERNET_FORGOT_PASSWORD_SCREEN } from '../navigation';

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
    onForgotPassword: async () => {
      const { isConnected } = await fetchNetInfo();
      if (isConnected) {
        dispatch(loadWebsite('https://tupaia.org/explore/explore/General#forgot-password'));
      } else {
        dispatch(navigateToScreen(NO_INTERNET_FORGOT_PASSWORD_SCREEN));
      }
    },
  };
}

const LoginContainer = connect(mapStateToProps, mapDispatchToProps)(LoginPage);

export { LoginContainer };
