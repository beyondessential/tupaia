import React from 'react';
import styled from 'styled-components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { AuthModalButton, Form, TextField } from '../../components';
import { useResetPassword } from '../../api/mutations';
import { FORM_FIELD_VALIDATION, URL_SEARCH_PARAMS } from '../../constants';
import { useSearchParams } from 'react-router-dom';

const StyledForm = styled(Form)`
  margin-top: 1rem;
  width: 22rem;
  max-width: 100%;
`;

const SuccessMessage = styled.p`
  text-align: center;
  padding: 0 0.9375rem;
`;

export const ResetPasswordForm = () => {
  const [urlSearchParams] = useSearchParams();
  const formContext = useForm();
  const { mutate: resetPassword, isLoading, isError, error, isSuccess } = useResetPassword();
  const passwordResetToken = urlSearchParams.get(URL_SEARCH_PARAMS.PASSWORD_RESET_TOKEN);

  return (
    <>
      {isError && <Typography color="error">{error.message}</Typography>}
      {isSuccess ? (
        <SuccessMessage>Your password has been updated</SuccessMessage>
      ) : (
        <StyledForm onSubmit={resetPassword as SubmitHandler<any>} formContext={formContext}>
          {/** Only display the 'current password' input if there is no reset token in the url */}
          {!passwordResetToken && (
            <TextField
              name="oldPassword"
              label="Current password"
              type="password"
              required
              options={FORM_FIELD_VALIDATION.PASSWORD}
              disabled={isLoading}
            />
          )}
          <TextField
            name="newPassword"
            label="New password"
            type="password"
            required
            options={FORM_FIELD_VALIDATION.PASSWORD}
            disabled={isLoading}
          />
          <TextField
            name="passwordConfirm"
            label="Confirm password"
            type="password"
            required
            options={{
              validate: (value: string) =>
                value === formContext.getValues('newPassword') || 'Passwords do not match.',
            }}
            disabled={isLoading}
          />
          <AuthModalButton type="submit" isLoading={isLoading}>
            Change password
          </AuthModalButton>
        </StyledForm>
      )}
    </>
  );
};
