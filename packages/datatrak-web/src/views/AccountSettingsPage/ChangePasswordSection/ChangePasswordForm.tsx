/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Form, FormInput, TextField } from '@tupaia/ui-components';
import { Button } from '../../../components';
import { ResetPasswordParams, useResetPassword } from '../../../api';
import { errorToast, successToast } from '../../../utils';

const StyledForm = styled(Form)`
  max-width: 44.25rem;
  width: 100%;
`;

const StyledFieldset = styled.fieldset`
  border: none;
  margin: 0;
  padding: 0;

  align-items: end;
  display: block flex;
  flex-direction: column;
  gap: 1.25rem;

  & > * {
    flex: 1;
    width: 100%;
  }

  ${({ theme }) => theme.breakpoints.up('sm')} {
    flex-direction: row;
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

const TextFieldWrapper = styled.div`
  display: block flex;
  flex-direction: column;
  gap: 1.56rem;
  width: 100%;
`;

const StyledTextField = styled(TextField)`
  margin: 0; // Use gap on parent to control spacing
`;

const StyledButton = styled(Button)``;

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
    formState: { isSubmitting, isValid, isValidating },
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
        <TextFieldWrapper>
          <FormInput
            autoComplete="password"
            Input={StyledTextField}
            inputProps={{ enterKeyHint: 'next' }}
            label="Current password"
            name="oldPassword"
            placeholder="Current password"
            required
            type="password"
          />
          <FormInput
            autoComplete="new-password"
            Input={StyledTextField}
            inputProps={{ enterKeyHint: 'next' }}
            label="New password"
            name="newPassword"
            options={{
              minLength: { value: 9, message: 'Must be over 8 characters long' },
            }}
            placeholder="New password"
            required
            type="password"
          />
          <FormInput
            autoComplete="new-password"
            Input={StyledTextField}
            inputProps={{ enterKeyHint: 'done' }}
            label="Confirm new password"
            name="newPasswordConfirm"
            options={{
              validate: (value: string) =>
                value === formContext.getValues('newPassword') || 'Passwords do not match',
            }}
            placeholder="Confirm new password"
            required
            type="password"
          />
        </TextFieldWrapper>
        <StyledButton
          type="submit"
          // tooltip={false ? null : 'Change password to save changes'}
          disabled={isValidating || !isValid || isSubmitting}
          fullWidth
        >
          {isSubmitting ? 'Changing…' : 'Change password'}
        </StyledButton>
      </StyledFieldset>
    </StyledForm>
  );
};