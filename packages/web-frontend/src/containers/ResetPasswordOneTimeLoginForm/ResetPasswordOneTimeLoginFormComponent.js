/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { PrimaryButton } from '../../components/Buttons';
import { Form } from '../Form';
import { WHITE } from '../../styles';
import { isMobile } from '../../utils';

const FullWidth = styled.div`
  text-align: left;
  grid-column: 1 / -1;
`;

const FormErrorMessage = styled.div`
  background: #fcf8e2;
  border: 1px solid #faecca;
  box-sizing: border-box;
  border-radius: 3px;
  padding: 15px;
  font-size: 14px;
  line-height: 1.5;
  color: #8b6e37;
`;

let Container = styled.div``;

if (isMobile()) {
  Container = styled.div`
    color: ${WHITE};
  `;
}

export const ResetPasswordOneTimeLoginFormComponent = ({
  isRequestingLogin,
  onAttemptOneTimeLogin,
  oneTimeLoginFailedMessage,
  passwordResetToken,
  onNavigateToRequestPasswordReset,
}) => (
  <Container>
    <Form
      isLoading={isRequestingLogin}
      onSubmit={() => onAttemptOneTimeLogin(passwordResetToken)}
      render={submitForm => (
        <>
          {oneTimeLoginFailedMessage && (
            <FullWidth>
              <FormErrorMessage>
                <span>The email link has expired or already been used.</span>
                <br />
                {
                  // eslint complains (correctly) that this isn't a real link, it can be changed after #770 implemented
                  /* eslint-disable */
                }
                <a href="#request-password-reset" onClick={e => { e.preventDefault(); onNavigateToRequestPasswordReset(); }}>Click here to request a
                  new password reset link</a>
                {
                  /* eslint-enable */
                }
              </FormErrorMessage>
            </FullWidth>
          )}
          <FullWidth>
            <p>Click the button below to set a new password.</p>
          </FullWidth>
          <FullWidth>
            <PrimaryButton fullWidth variant="contained" onClick={submitForm}>
              Reset Password Now
            </PrimaryButton>
          </FullWidth>
        </>
      )}
    />
  </Container>
);

ResetPasswordOneTimeLoginFormComponent.defaultProps = {
  oneTimeLoginFailedMessage: null,
};

ResetPasswordOneTimeLoginFormComponent.propTypes = {
  isRequestingLogin: PropTypes.bool.isRequired,
  onAttemptOneTimeLogin: PropTypes.func.isRequired,
  oneTimeLoginFailedMessage: PropTypes.string,
  passwordResetToken: PropTypes.string.isRequired,
  onNavigateToRequestPasswordReset: PropTypes.func.isRequired,
};
