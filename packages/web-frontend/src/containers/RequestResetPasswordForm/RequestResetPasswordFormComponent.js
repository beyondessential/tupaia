/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { Form } from '../Form';
import { TextField } from '../Form/Fields';
import { WHITE } from '../../styles';
import { isMobile } from '../../utils';
import { FlexSpaceBetween } from '../../components/Flexbox';

const CheckEmailMessage = styled.p`
  text-align: center;
  padding: 0 15px;
  grid-column: 1 / -1;
`;

const Container = styled.div`
  color: ${WHITE};

  h4 {
    margin-bottom: ${isMobile && '0'};
    margin-left: ${isMobile && '18px'};
  }

  > div {
    padding-top: ${isMobile && '0'};
  }
`;

const FormActions = styled(FlexSpaceBetween)`
  margin-top: 16px;

  > button {
    flex: 1;
  }
`;

const SuccessMessage = () => (
  <CheckEmailMessage>
    Please check your email for further instructions on how to reset your password.
  </CheckEmailMessage>
);

export const RequestResetPasswordFormComponent = ({
  isRequestingResetPassword,
  resetPasswordFailedMessage,
  onAttemptResetPassword,
  hasResetPasswordCompleted,
  onClickCancel,
}) => {
  return (
    <Container>
      <h4>Enter your account email</h4>
      <Form
        isLoading={isRequestingResetPassword}
        formError={resetPasswordFailedMessage}
        onSubmit={({ email }) => onAttemptResetPassword(email)}
        render={submitForm => (
          <>
            {hasResetPasswordCompleted ? (
              <SuccessMessage />
            ) : (
              <TextField fullWidth label="E-mail" name="email" required />
            )}
            <FormActions>
              <Button disabled={hasResetPasswordCompleted} variant="outlined" onClick={submitForm}>
                Reset Password
              </Button>
              <Button onClick={onClickCancel}>Back</Button>
            </FormActions>
          </>
        )}
      />
    </Container>
  );
};

RequestResetPasswordFormComponent.propTypes = {
  isRequestingResetPassword: PropTypes.bool,
  resetPasswordFailedMessage: PropTypes.string.isRequired,
  onAttemptResetPassword: PropTypes.func.isRequired,
  onClickCancel: PropTypes.func.isRequired,
  hasResetPasswordCompleted: PropTypes.bool.isRequired,
};

RequestResetPasswordFormComponent.defaultProps = {
  isRequestingResetPassword: false,
};
