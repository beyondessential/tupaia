/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useCurrentUser } from '../../api';
import { AccountSettingsSection } from './AccountSettingsSection';
import { Button } from '../../components';
import { TextField } from '@tupaia/ui-components';
import { useEditUser } from '../../api/mutations';
import { DatatrakWebUserRequest } from '@tupaia/types';

type PersonalDetailsFormFields = Pick<
  DatatrakWebUserRequest.ResBody,
  'firstName' | 'lastName' | 'mobileNumber' | 'employer' | 'position'
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
  const { mutate: updateUser } = useEditUser();
  const user = useCurrentUser();

  const {
    control,
    formState: { isDirty, dirtyFields },
    handleSubmit,
    register,
  } = useForm<PersonalDetailsFormFields>({
    defaultValues: {
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      mobileNumber: user.contactNumber ?? '',
      employer: user.employer ?? '',
      position: user.position ?? '',
    },
  });

  function onSubmit(
    userDetails: DatatrakWebUserRequest.ResBody,
  ): SubmitHandler<PersonalDetailsFormFields> {
    for (const field in userDetails) {
      if (!dirtyFields[field]) {
        delete userDetails[field];
      }
    }

    updateUser(userDetails);
  }

  return (
    <AccountSettingsSection title="Personal details" description="Edit your personal details">
      <PersonalDetailsForm onSubmit={handleSubmit(details => onSubmit(details))}>
        <Controller
          control={control}
          name="firstName"
          as={
            <StyledTextField
              label="First name"
              placeholder="First name"
              autoComplete="given-name"
              inputProps={{ enterKeyHint: 'next' }}
              {...register('firstName', { required: true })}
              required
            />
          }
        />
        <Controller
          control={control}
          name="lastName"
          as={
            <StyledTextField
              label="Last name"
              placeholder="Last name"
              autoComplete="family-name"
              inputProps={{ enterKeyHint: 'next' }}
              {...register('lastName', { required: true })}
              required
            />
          }
        />
        <StyledTextField
          name="email"
          label="Email"
          placeholder="Email"
          title="You cannot change your email address"
          autoComplete="email"
          value={user.email}
          required
          disabled
        />
        <Controller
          control={control}
          name="mobileNumber"
          as={
            <StyledTextField
              label="Contact number (optional)"
              placeholder="Contact number"
              autoComplete="tel"
              inputProps={{ enterKeyHint: 'next', inputMode: 'tel' }}
              {...register('mobileNumber', { required: true })}
            />
          }
        />
        <Controller
          control={control}
          name="employer"
          as={
            <StyledTextField
              label="Employer"
              placeholder="Employer"
              autoComplete="organization"
              inputProps={{ enterKeyHint: 'next' }}
              {...register('employer', { required: true })}
              required
            />
          }
        />
        <Controller
          control={control}
          name="position"
          as={
            <StyledTextField
              label="Position"
              placeholder="Position"
              autoComplete="organization-title"
              inputProps={{ enterKeyHint: 'done' }}
              {...register('position', { required: true })}
              required
            />
          }
        />
        <ButtonWrapper>
          {/* Wrapper needed to apply grid-column because tooltip attribute on <Button> wraps it in a flexbox */}
          <Button
            type="submit"
            tooltip={isDirty ? null : 'Change details to save changes'}
            disabled={!isDirty}
            fullWidth
          >
            Save changes
          </Button>
        </ButtonWrapper>
      </PersonalDetailsForm>
    </AccountSettingsSection>
  );
};
