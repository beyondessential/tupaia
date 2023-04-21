/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Container for Login Form
 */
import { connect } from 'react-redux';

import { attemptUserLogin, closeUserPage } from '../../actions';
import { LoginFormComponent } from './LoginFormComponent';
import { MobileLoginFormComponent } from './MobileLoginFormComponent';
import { isMobile } from '../../utils';

const FormComponent = isMobile() ? MobileLoginFormComponent : LoginFormComponent;

const mapStateToProps = state => {
  const { loginFailedMessage, isRequestingLogin, successMessage, emailVerified } =
    state.authentication;

  return {
    loginFailedMessage,
    isRequestingLogin,
    successMessage,
    emailVerified,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAttemptUserLogin: (email, password) => dispatch(attemptUserLogin(email, password)),
    onClose: () => dispatch(closeUserPage()),
  };
};

export const LoginForm = connect(mapStateToProps, mapDispatchToProps)(FormComponent);
