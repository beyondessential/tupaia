import React from 'react';
import { AccountSettingsSection } from '../AccountSettingsSection';
import { ChangePasswordForm } from './ChangePasswordForm';

export const ChangePasswordSection = () => {
  return (
    <AccountSettingsSection
      title="Change password"
      description="To change your password please enter your current password, your new password and confirm your new password"
    >
      <ChangePasswordForm />
    </AccountSettingsSection>
  );
};
