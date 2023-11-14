/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useUser } from '../../api/queries';
import { AccountSettingsSection } from './AccountSettingsSection';
import { Button } from '../../components';
import { TextField } from '@tupaia/ui-components';

export const PersonalDetailsSection = () => {
  const { data: user } = useUser();

  const ActionButton = styled(Button)`
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
      font-weight: 500;
    }
  `;

  return (
    <AccountSettingsSection title="Personal details" description="Edit your personal details">
      <PersonalDetailsForm>
        <StyledTextField
          name="firstName"
          label="First name"
          placeholder="First name"
          autoComplete="given-name"
          value={user.firstName}
          required
        />
        <StyledTextField
          name="lastName"
          label="Last name"
          placeholder="Last name"
          autoComplete="family-name"
          value={user.lastName}
          required
        />
        <StyledTextField
          name="email"
          label="Email"
          placeholder="Email"
          tooltip="You cannot change your email address"
          autoComplete="email"
          value={user.email}
          required
          disabled
        />
        <StyledTextField
          name="contactNumber"
          label="Contact number (optional)"
          placeholder="Contact number"
          autoComplete="tel"
          value={user.contactNumber}
        />
        <StyledTextField
          name="employer"
          label="Employer"
          placeholder="Employer"
          value={user.employer}
          required
        />
        <StyledTextField
          name="position"
          label="Position"
          placeholder="Position"
          value={user.position}
          required
        />
        <ActionButton tooltip="Change details to save changes">Save changes</ActionButton>
      </PersonalDetailsForm>
    </AccountSettingsSection>
  );
};
