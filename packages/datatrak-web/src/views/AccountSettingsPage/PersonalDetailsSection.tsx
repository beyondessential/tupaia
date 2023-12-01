/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { SubmitHandler, useForm } from 'react-hook-form';
import { TextField } from '@tupaia/ui-components';
import { AccountSettingsSection } from './AccountSettingsSection';
import { Button } from '../../components';
import { successToast } from '../../utils';
import { useCurrentUser, useEditUser } from '../../api';
import { UserAccountDetails } from '../../types';

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

const PersonalDetailsForm = styled.form`
  display: grid;
  gap: 1.56rem 1.25rem;
  max-width: 44.25rem;
  width: 100%;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    grid-template-columns: repeat(2, 1fr);
  }

  .MuiFormLabel-root {
    color: ${props => props.theme.palette.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }
`;

export const PersonalDetailsSection = () => {
  const { mutate: updateUser } = useEditUser(() =>
    successToast('Your personal details have been successfully updated'),
  );
  const user = useCurrentUser();

  const {
    formState,
    formState: { isDirty, dirtyFields, isSubmitting, isSubmitSuccessful },
    handleSubmit,
    register,
    reset,
  } = useForm<PersonalDetailsFormFields>({
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      mobileNumber: user.mobileNumber ?? '',
      employer: user.employer ?? '',
      position: user.position ?? '',
    } as PersonalDetailsFormFields,
  });

  function onSubmit(
    userDetails: PersonalDetailsFormFields,
  ): SubmitHandler<PersonalDetailsFormFields> {
    console.log('onSubmit');
    const updates: UserAccountDetails = Object.fromEntries(
      Object.entries(userDetails).filter(([field]) => dirtyFields[field]),
    );

    updateUser(updates);
  }

  useEffect(() => {
    console.log('useEffect');
    console.log('isSubmitSuccessful', isSubmitSuccessful);
    if (isSubmitSuccessful) {
      reset({
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        mobileNumber: user.mobileNumber ?? '',
        employer: user.employer ?? '',
        position: user.position ?? '',
      } as PersonalDetailsFormFields);
    }
  }, [formState, reset]);

  return (
    <AccountSettingsSection title="Personal details" description="Edit your personal details">
      <PersonalDetailsForm onSubmit={handleSubmit(onSubmit)}>
        <StyledTextField
          autoComplete="given-name"
          inputProps={{ enterKeyHint: 'next' }}
          inputRef={register({ required: true })}
          label="First name"
          name="firstName"
          placeholder="First name"
          required
        />
        <StyledTextField
          autoComplete="family-name"
          inputProps={{ enterKeyHint: 'next' }}
          inputRef={register({ required: true })}
          label="Last name"
          name="lastName"
          placeholder="Last name"
          required
        />
        <StyledTextField
          autoComplete="email"
          disabled
          inputProps={{ enterKeyHint: 'next', inputMode: 'email' }}
          label="Email"
          name="email"
          placeholder="Email"
          required
          tooltip="You cannot change your email address"
          type="email"
          value={user.email}
        />
        <StyledTextField
          autoComplete="tel"
          inputProps={{ enterKeyHint: 'next', inputMode: 'tel' }}
          inputRef={register}
          label="Contact number (optional)"
          name="mobileNumber"
          placeholder="Contact number"
          type="tel"
        />
        <StyledTextField
          autoComplete="organization"
          inputProps={{ enterKeyHint: 'next' }}
          inputRef={register({ required: true })}
          label="Employer"
          name="employer"
          placeholder="Employer"
          required
        />
        <StyledTextField
          autoComplete="organization-title"
          inputProps={{ enterKeyHint: 'done' }}
          inputRef={register({ required: true })}
          label="Position"
          name="position"
          placeholder="Position"
          required
        />
        <ButtonWrapper>
          {/* Wrapper needed to apply grid-column because tooltip attribute on <Button> wraps it in a flexbox */}
          <Button
            type="submit"
            tooltip={isDirty ? null : 'Change details to save changes'}
            disabled={!isDirty || isSubmitting}
            fullWidth
          >
            Save changes
          </Button>
        </ButtonWrapper>
      </PersonalDetailsForm>
    </AccountSettingsSection>
  );
};
