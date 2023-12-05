/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Form, FormInput, TextField } from '@tupaia/ui-components';
import { Button } from '../../../components';
import { UserAccountDetails } from '../../../types';
import { successToast } from '../../../utils';
import { useCurrentUser, useEditUser } from '../../../api';

type PersonalDetailsFormFields = Pick<
  UserAccountDetails,
  'firstName' | 'lastName' | 'employer' | 'position' | 'mobileNumber'
>;

const ButtonWrapper = styled.div`
  grid-column: -2;
`;

const StyledTextField = styled(TextField)`
  margin: 0; // Use gap on parent to control spacing
`;

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

export const PersonalDetailsForm = () => {
  const user = useCurrentUser();

  const formContext = useForm<PersonalDetailsFormFields>({
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      mobileNumber: user.mobileNumber ?? '',
      employer: user.employer ?? '',
      position: user.position ?? '',
    } as PersonalDetailsFormFields,
    mode: 'onBlur',
  });

  const {
    formState: { dirtyFields, isDirty, isSubmitting, isValid, isValidating },
    getValues,
    handleSubmit,
    reset,
  } = formContext;

  function handleSubmissionSuccess(): void {
    reset(getValues() as PersonalDetailsFormFields);
    successToast('Your personal details have been successfully updated');
  }
  const { isLoading, mutate: updateUser } = useEditUser(handleSubmissionSuccess);

  function onSubmit(
    userDetails: PersonalDetailsFormFields,
  ): SubmitHandler<PersonalDetailsFormFields> {
    const updates: PersonalDetailsFormFields = Object.fromEntries(
      Object.entries(userDetails).filter(([field]) => dirtyFields[field]),
    );

    updateUser(updates as UserAccountDetails);
  }

  return (
    <StyledForm onSubmit={handleSubmit(onSubmit)} formContext={formContext}>
      <StyledFieldset disabled={isSubmitting || isLoading}>
        <FormInput
          autoComplete="given-name"
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'next' }}
          label="First name"
          name="firstName"
          options={{
            validate: (value: string) => !!value.trim() || 'First name must not be empty',
          }}
          placeholder="First name"
          required
        />
        <FormInput
          autoComplete="family-name"
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'next' }}
          label="Last name"
          name="lastName"
          options={{
            validate: (value: string) => !!value.trim() || 'Last name must not be empty',
          }}
          placeholder="Last name"
          required
        />
        <FormInput
          autoComplete="email"
          disabled
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'next', inputMode: 'email' }}
          label="Email"
          name="email"
          placeholder="Email"
          required
          tooltip="You cannot change your email address"
          type="email"
          value={user.email}
        />
        <FormInput
          autoComplete="tel"
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'next', inputMode: 'tel' }}
          label="Contact number (optional)"
          name="mobileNumber"
          placeholder="Contact number"
          type="tel"
        />
        <FormInput
          autoComplete="organization"
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'next' }}
          label="Employer"
          name="employer"
          options={{
            validate: (value: string) => !!value.trim() || 'Employer must not be empty',
          }}
          placeholder="Employer"
          required
        />
        <FormInput
          autoComplete="organization-title"
          Input={StyledTextField}
          inputProps={{ enterKeyHint: 'done' }}
          label="Position"
          name="position"
          options={{
            validate: (value: string) => !!value.trim() || 'Position must not be empty',
          }}
          placeholder="Position"
          required
        />
        <ButtonWrapper>
          {/* Wrapper needed to apply grid-column because tooltip attribute on <Button> wraps it in a flexbox */}
          <Button
            type="submit"
            tooltip={isDirty ? null : 'Change details to save changes'}
            disabled={!isDirty || isValidating || !isValid || isSubmitting || isLoading}
            fullWidth
          >
            {isSubmitting || isLoading ? 'Saving' : 'Save changes'}
          </Button>
        </ButtonWrapper>
      </StyledFieldset>
    </StyledForm>
  );
};
