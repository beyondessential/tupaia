/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Meta } from '@storybook/react';
import { AuthModal } from '../../src/layout/AuthModal';

const meta: Meta<typeof AuthModal> = {
  title: 'layout/AuthModal',
  component: AuthModal,
};

export default meta;

export const Simple = () => {
  return (
    <AuthModal title="Login" subtitle="Login here" navigateTo={window.location.pathname}>
      Hi, I am an auth modal
    </AuthModal>
  );
};

export const PrimaryButton = () => {
  return (
    <AuthModal
      title="Login"
      subtitle="Login here"
      navigateTo={window.location.pathname}
      primaryButton={{
        text: 'Login',
        onClick: () => {},
      }}
    >
      Hi, I am an auth modal
    </AuthModal>
  );
};

export const SecondaryButton = () => {
  return (
    <AuthModal
      title="Login"
      subtitle="Login here"
      navigateTo={window.location.pathname}
      primaryButton={{
        text: 'Login',
        onClick: () => {},
      }}
      secondaryButton={{
        text: 'Cancel',
        onClick: () => {},
      }}
    >
      Hi, I am an auth modal
    </AuthModal>
  );
};
