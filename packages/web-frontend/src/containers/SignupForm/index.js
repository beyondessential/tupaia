/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';
import { attemptUserSignup, closeUserPage } from '../../actions';

import { SignupComponent } from './SignupComponent';

const mapStateToProps = state => {
  const { signupFailedMessage, isRequestingSignup, signupComplete } = state.signup;

  return {
    signupFailedMessage,
    isRequestingSignup,
    signupComplete,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAttemptUserSignup: fields => dispatch(attemptUserSignup(fields)),
    onClose: () => dispatch(closeUserPage()),
  };
};

export const SignupForm = connect(mapStateToProps, mapDispatchToProps)(SignupComponent);
