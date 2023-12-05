/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Form, FormInput, TextField } from '@tupaia/ui-components';
import { Button } from '../../../components';
import { errorToast, successToast } from '../../../utils';
import { ResetPasswordParams } from '../../../types';
import { useResetPassword } from '../../../api';

const StyledForm = styled(Form)`
  width: 100%;

  ${({ theme }) => theme.breakpoints.up('md')} {
    max-width: 44.25rem;
  }
`;

const StyledFieldset = styled.fieldset`
  border: none;
  margin: 0;
  padding: 0;

  align-items: end;
  display: grid;
  gap: 1.56rem 1.25rem;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    grid-template-columns: repeat(2, 1fr);
  }

  .MuiFormLabel-root {
    color: ${props => props.theme.palette.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }

  .MuiInputLabel-outlined {
    // Fix labels appearing over hamburger menu drawer (in md and sm size classes)
    z-index: auto;
  }
`;

const StyledTextField = styled(TextField)`
  margin: 0; // Use gap on parent to control spacing
`;

const StyledFormInput = styled(FormInput)`
  grid-column: 1 / 2;
`;

const StyledButton = styled(Button)`
  ${({ theme }) => theme.breakpoints.up('sm')} {
    // HACK: Make button height match adjacent FormInput
    .MuiButton-label {
      border: 1px solid transparent;
      height: 1.1876em;
      padding: 1rem;
    }
  }
`;

export const ChangePasswordForm = () => {
  const emptyFormState: ResetPasswordParams = {
    oldPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  };

  const formContext = useForm<ResetPasswordParams>({
    defaultValues: emptyFormState,
    mode: 'onChange',
  });
  const {
    formState: { touched, isSubmitting, isValid, isValidating },
    getValues,
    handleSubmit,
    reset,
  } = formContext;

  const { mutate: attemptPasswordChange } = useResetPassword({
    onError: () => errorToast('Could not update your password'),
    onSettled: () => reset(emptyFormState),
    onSuccess: () => successToast('Your password has been successfully updated'),
  });

  return (
    <StyledForm onSubmit={handleSubmit(attemptPasswordChange)} formContext={formContext}>
      <StyledFieldset>
        <StyledFormInput
          autoComplete="password"
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'next' }}
          label="Current password"
          name="oldPassword"
          placeholder="Current password"
          required
          type="password"
        />
        <StyledFormInput
          autoComplete="new-password"
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'next' }}
          label="New password"
          name="newPassword"
          options={{
            minLength: { value: 9, message: 'Must be over 8 characters long' },
            validate: (value: string) => {
              return (
                !(touched as Partial<ResetPasswordParams>).newPasswordConfirm ||
                value === getValues('newPasswordConfirm') ||
                'Passwords do not match'
              );
            },
          }}
          placeholder="New password"
          required
          type="password"
        />
        <StyledFormInput
          autoComplete="new-password"
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'done' }}
          label="Confirm new password"
          name="newPasswordConfirm"
          options={{
            validate: (value: string) =>
              value === getValues('newPassword') || 'Passwords do not match',
          }}
          placeholder="Confirm new password"
          required
          type="password"
        />
        <StyledButton type="submit" disabled={isValidating || !isValid || isSubmitting} fullWidth>
          {isSubmitting ? 'Changing' : 'Change password'}
        </StyledButton>
      </StyledFieldset>
    </StyledForm>
  );
};
