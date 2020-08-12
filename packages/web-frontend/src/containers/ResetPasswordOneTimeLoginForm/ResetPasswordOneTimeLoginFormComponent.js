/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { PrimaryButton } from '../../components/Buttons';
import { Form } from '../Form';
import styled from 'styled-components';

const FullWidth = styled.div`
  text-align: left;
  grid-column: 1 / -1;
`;

export const ResetPasswordOneTimeLoginFormComponent = ({
    isRequestingLogin,
    onAttemptOneTimeLogin,
    oneTimeLoginFailedMessage,
    passwordResetToken,
    onNavigateToRequestPasswordReset,
  }) => {

  return (
    <>
      <Form
        isLoading={isRequestingLogin}
        onSubmit={() => onAttemptOneTimeLogin(passwordResetToken)}
        formError={oneTimeLoginFailedMessage}
        render={submitForm => (
          <>
            <FullWidth>
              <p>Continue to finish resetting your password</p>
            </FullWidth>
            <FullWidth>
              <PrimaryButton variant="contained" onClick={submitForm}>
                Continue
              </PrimaryButton>
            </FullWidth>
          </>
        )}
      />
      { oneTimeLoginFailedMessage &&
        <p style={{textAlign: 'center'}}>Please <a href="#" onClick={e => { e.preventDefault(); onNavigateToRequestPasswordReset(); }}>
          request a new password reset link</a></p>
      }
    </>
  );
};

ResetPasswordOneTimeLoginFormComponent.propTypes = {
  isRequestingLogin: PropTypes.bool.isRequired,
  onAttemptOneTimeLogin: PropTypes.func.isRequired,
  oneTimeLoginFailedMessage: PropTypes.string,
  passwordResetToken: PropTypes.string.isRequired,
  onNavigateToRequestPasswordReset: PropTypes.func.isRequired,
};
