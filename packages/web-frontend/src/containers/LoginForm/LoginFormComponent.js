/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Component for Login Form
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { Form } from '../Form';
import { TextField } from '../Form/Fields';
import { emailAddress } from '../Form/validators';
import { ForgotPassword } from './ForgotPassword';
import { SubmitButton } from '../Form/common/SubmitButton';

const PasswordField = styled(TextField)`
  margin-bottom: 16px;
`;

export const LoginFormComponent = ({
  isRequestingLogin,
  loginFailedMessage,
  onClickResetPassword,
  onAttemptUserLogin,
}) => {
  return (
    <Form
      onSubmit={({ email, password }) => onAttemptUserLogin(email, password)}
      isLoading={isRequestingLogin}
      formError={loginFailedMessage}
      render={submitForm => (
        <React.Fragment>
          <TextField fullWidth label="E-mail" name="email" validators={[emailAddress]} required />
          <PasswordField
            fullWidth
            label="Password"
            name="password"
            type="password"
            required
            onKeyPress={e => e.key === 'Enter' && submitForm()}
          />
          <ForgotPassword handleClick={onClickResetPassword} />
          <SubmitButton text="Sign in" handleClick={submitForm} />
        </React.Fragment>
      )}
    />
  );
};

LoginFormComponent.propTypes = {
  isRequestingLogin: PropTypes.bool.isRequired,
  loginFailedMessage: PropTypes.string,
  onAttemptUserLogin: PropTypes.func.isRequired,
  onClickResetPassword: PropTypes.func.isRequired,
};

LoginFormComponent.defaultProps = {
  loginFailedMessage: null,
};
