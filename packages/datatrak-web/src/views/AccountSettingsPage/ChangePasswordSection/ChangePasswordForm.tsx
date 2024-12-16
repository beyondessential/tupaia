/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Form, FORM_FIELD_VALIDATION, FormInput, TextField } from '@tupaia/ui-components';
import { Button } from '../../../components';
import { errorToast, successToast } from '../../../utils';
import { ResetPasswordParams, useResetPassword } from '../../../api';

const StyledForm = styled(Form)`
  width: 100%;

  ${({ theme }) => theme.breakpoints.up('md')} {
    max-width: 44.25rem;
  }
`;

const StyledFieldset = styled.fieldset`
  align-items: start;
  display: grid;
  gap: 1.56rem 1.25rem;
  grid-auto-flow: column;
  grid-template-rows: repeat(4, auto);

  ${({ theme }) => theme.breakpoints.up('sm')} {
    grid-template: repeat(3, auto) / repeat(2, 1fr);
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

const StyledButton = styled(Button)`
  ${({ theme }) => theme.breakpoints.up('sm')} {
    grid-row: -2 / -1;

    /* HACK: Align button with adjacent FormInput, even when FormInput in error state */
    margin-block-start: calc(1.125rem + 3px);
    //                                  ^~~ margin-bottom of .MuiFormLabel-root
    //                       ^~~~~~~~ line-height of .MuiFormLabel-root

    /* HACK: Make button height match adjacent FormInput */
    padding: 1rem; // padding of .MuiInputBase-input
    .MuiButton-label {
      border: 1px solid transparent; // border-width of .MuiOutlinedInput-notchedOutline
      height: 1.1876em; // height of .MuiInputBase-input
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
    formState: { isDirty, isSubmitting, isValid, isValidating },
    getValues,
    reset,
  } = formContext;

  const { mutate: attemptPasswordChange } = useResetPassword({
    onError: error =>
      errorToast(error?.message ?? 'Sorry, couldn’t update your password. Please try again'),
    onSettled: () => reset(emptyFormState),
    onSuccess: response => successToast(response.message),
  });

  const formIsInsubmissible = isValidating || !isValid || isSubmitting;

  return (
    <StyledForm onSubmit={attemptPasswordChange} formContext={formContext}>
      <StyledFieldset>
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
          options={FORM_FIELD_VALIDATION.PASSWORD}
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
              value === getValues('newPassword') || 'Passwords do not match',
          }}
          placeholder="Confirm new password"
          required
          type="password"
        />
        <StyledButton
          type="submit"
          disabled={formIsInsubmissible}
          fullWidth
          tooltip={isDirty ? null : 'Change password to save changes'}
        >
          {isSubmitting ? 'Changing' : 'Change password'}
        </StyledButton>
      </StyledFieldset>
    </StyledForm>
  );
};
