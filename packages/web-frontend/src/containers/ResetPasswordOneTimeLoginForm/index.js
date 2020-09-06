/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * The second to last step in the password reset flow: log in with the one-time-login token sent
 * in the email before proceeding to the final step, setting a new password.
 *
 * This step requires the user to explicitly do something before continuing, to prevent an issue
 * we had before where this step was done on page load, and if the user opened this link in multiple
 * tabs the first would consume the token, and the rest would fail. Making it a button means the user
 * has to press the button to consume the token, and so it prevents this issue.
 */
import { connect } from 'react-redux';
import { ResetPasswordOneTimeLoginFormComponent } from './ResetPasswordOneTimeLoginFormComponent';
import { attemptResetTokenLogin } from '../../actions';

const mapStateToProps = state => {
  const { passwordResetToken } = state.changePassword;
  const { oneTimeLoginFailedMessage, isRequestingLogin } = state.authentication;

  return {
    passwordResetToken,
    oneTimeLoginFailedMessage,
    isRequestingLogin,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAttemptOneTimeLogin: token => dispatch(attemptResetTokenLogin(token)),
  };
};

export const OneTimeLoginForm = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ResetPasswordOneTimeLoginFormComponent);
