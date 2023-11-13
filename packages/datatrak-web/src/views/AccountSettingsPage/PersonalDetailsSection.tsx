/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { AccountSettingsSection } from './AccountSettingsSection';
import { Button } from '../../components';
import { TextField } from '@tupaia/ui-components';

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

  & label {
    color: #2e2f33 !important; // TODO: Get colour from theme
    font-weight: 500;
  }
`;

const accountSettingsForm = (
  <PersonalDetailsForm>
    <StyledTextField
      name="firstName"
      label="First name"
      placeholder="First name"
      autoComplete="given-name"
      required
    />
    <StyledTextField
      name="lastName"
      label="Last name"
      placeholder="Last name"
      autoComplete="family-name"
      required
    />
    <StyledTextField
      name="email"
      label="Email"
      placeholder="Email"
      autoComplete="email"
      required
      disabled
    ></StyledTextField>
    <StyledTextField
      name="contactNumber"
      label="Contact number (optional)"
      placeholder="Contact number"
      autoComplete="tel"
    />
    <StyledTextField name="employer" label="Employer" placeholder="Employer" required />
    <StyledTextField name="position" label="Position" placeholder="Position" required />
    <ActionButton>Save changes</ActionButton>
  </PersonalDetailsForm>
);

export const PersonalDetailsSection = () => {
  return (
    <AccountSettingsSection
      title="Personal details"
      description="Edit your personal details"
      children={accountSettingsForm}
    />
  );
};
