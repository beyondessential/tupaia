/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiDivider from '@material-ui/core/Divider';
import { useForm } from 'react-hook-form';
import { Button, TextField, SmallAlert } from '@tupaia/ui-components';
import { PageHeader } from '../widgets';
import { PasswordStrengthBar } from '../widgets/PasswordStrengthBar';
import { useUser } from '../api/queries';
import { useResetPassword } from '../api/mutations';

const Wrapper = styled.div`
  overflow: auto;
`;

const Container = styled.section`
  padding-top: 1rem;
  padding-bottom: 1rem;
  max-width: 26rem;
  margin: 2.5rem auto;
`;

const StyledButton = styled(Button)`
  margin-top: 1rem;
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.palette.error.main};
`;

const SuccessMessage = styled(SmallAlert)`
  margin-top: -1rem;
  margin-bottom: 1.5rem;
`;

const Divider = styled(MuiDivider)`
  margin: 0.5rem 0 1.8rem;
`;

export const ChangePasswordPage = React.memo(() => {
  const { data: user } = useUser();
  const { mutate: resetPassword, isLoading, isSuccess, error } = useResetPassword();
  const { handleSubmit, register, errors, watch } = useForm();

  if (!user) return null;

  const onSubmit = handleSubmit(data => {
    resetPassword(data);
  });

  const newPassword = watch('newPassword');

  return (
    <Wrapper>
      <Container>
        <PageHeader title={user.name} />
        <form onSubmit={onSubmit} noValidate>
          {error && <ErrorMessage>{error.message}</ErrorMessage>}
          {isSuccess && <SuccessMessage>Password successfully updated.</SuccessMessage>}
          <TextField
            label="Current Password"
            name="oldPassword"
            autoComplete="current-password"
            placeholder="Enter your current password"
            required
            type="password"
            error={!!errors.oldPassword}
            helperText={errors.oldPassword && errors.oldPassword.message}
            inputRef={register({
              required: 'Required',
            })}
          />
          <Divider />
          <TextField
            label="New Password"
            name="newPassword"
            placeholder="Enter your password"
            required
            type="password"
            error={!!errors.newPassword}
            helperText={errors.newPassword && errors.newPassword.message}
            inputRef={register({
              required: 'Required',
              minLength: { value: 9, message: 'Password must be over 8 characters long.' },
            })}
          />
          <TextField
            label="Confirm Password"
            name="newPasswordConfirm"
            placeholder="Enter your password"
            required
            type="password"
            error={!!errors.newPasswordConfirm}
            helperText={errors.newPasswordConfirm && errors.newPasswordConfirm.message}
            inputRef={register({
              required: 'Required',
              minLength: { value: 9, message: 'Password must be over 8 characters long.' },
              validate: value => value === newPassword || 'Passwords do not match.',
            })}
          />
          <PasswordStrengthBar
            password={newPassword}
            helperText="New password must be over 8 characters long."
            pt={1}
            pb={4}
          />
          <StyledButton type="submit" fullWidth isLoading={isLoading}>
            Save Password
          </StyledButton>
        </form>
      </Container>
    </Wrapper>
  );
});
