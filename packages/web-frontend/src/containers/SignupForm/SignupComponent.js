/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Component for Sign Up Form
 */

import React from 'react';
import PropTypes from 'prop-types';

import { SignupFormComponent } from './SignupFormComponent';
import { SignupComplete } from './SignupComplete';

export const SignupComponent = ({
  signupFailedMessage,
  signupComplete,
  isRequestingSignup,
  onAttemptUserSignup,
  handleLogin,
  className,
}) => {
  if (signupComplete) return <SignupComplete onClickLogin={handleLogin} />;

  return (
    <div className={className}>
      <SignupFormComponent
        isRequestingSignup={isRequestingSignup}
        signupFailedMessage={signupFailedMessage}
        onAttemptUserSignup={onAttemptUserSignup}
      />
    </div>
  );
};

SignupComponent.propTypes = {
  isRequestingSignup: PropTypes.bool.isRequired,
  signupFailedMessage: PropTypes.string.isRequired,
  onAttemptUserSignup: PropTypes.func.isRequired,
  handleLogin: PropTypes.func.isRequired,
  signupComplete: PropTypes.bool.isRequired,
  className: PropTypes.string,
};

SignupComponent.defaultProps = {
  className: '',
};
