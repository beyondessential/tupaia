/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TextField } from '../../components';

const CheckEmailMessage = styled.p`
  text-align: center;
  padding: 0 15px;
`;

export const VerifyEmailForm = ({
  onResendEmail,
  hasSentEmail,
  messageFailEmailVerify,
  currentUserEmail,
}) => {
  const titleText = 'Sign in to Tupaia';

  <StyledAuthModal title="Register" subtitle="Enter your details below to create an account">
    {hasSentEmail ? (
    <CheckEmailMessage>
      Please check your email for further instructions on how to verify your account.
    </CheckEmailMessage>
  ) : (
    <FormWrapper titleText={titleText}>
      <div>
        <Form
          formError={messageFailEmailVerify}
          onSubmit={email => onResendEmail(email)}
          render={submitForm => (
            <>
              <TextField
                fullWidth
                label="E-mail"
                name="email"
                defaultValue={currentUserEmail}
                validators={[emailAddress]}
                required
              />
              <SubmitButton handleClick={submitForm} gutterTop>
                Re-send Email
              </SubmitButton>
            </>
          )}
        />
      </div>
    </FormWrapper>}
  </StyledAuthModal>
  );
};
