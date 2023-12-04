/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Form, FormInput, TextField } from '@tupaia/ui-components';
import { Button } from '../../../components';

interface ChangePasswordFormFields {
  password: string;
  passwordConfirm: string;
}

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

export const ChangePasswordForm = () => {
  // const user = useCurrentUser();

  const formContext = useForm<ChangePasswordFormFields>();
  const {
    formState: { isSubmitting },
    handleSubmit,
    // reset,
  } = formContext;

  return (
    <StyledForm onSubmit={handleSubmit()} formContext={formContext}>
      <StyledFieldset>
        <TextFieldWrapper>
          <FormInput
            autoComplete="password"
            Input={StyledTextField}
            inputProps={{ enterKeyHint: 'next' }}
            label="Current password"
            name="currentPassword"
            placeholder="Current password"
            required
          />
          <FormInput
            autoComplete="new-password"
            Input={StyledTextField}
            inputProps={{ enterKeyHint: 'next' }}
            label="New password"
            name="newPassword"
            placeholder="New password"
            required
          />
          <FormInput
            autoComplete="new-password"
            Input={StyledTextField}
            inputProps={{ enterKeyHint: 'done' }}
            label="Confirm new password"
            name="newPasswordConfirm"
            placeholder="Confirm new password"
            required
          />
        </TextFieldWrapper>
        <Button
          type="submit"
          tooltip={false ? null : 'Change password to save changes'}
          disabled={!true || isSubmitting}
          fullWidth
        >
          {isSubmitting ? 'Changing…' : 'Change password'}
        </Button>
      </StyledFieldset>
    </StyledForm>
  );
};
