/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from '../../src/components/Alert';

const meta: Meta<typeof Alert> = {
  title: 'components/Alert',
  component: Alert,
};

export default meta;

type Story = StoryObj<typeof Alert>;
export const Success: Story = {
  render: () => <Alert severity="success">This is a success alert</Alert>,
};

export const Warning: Story = {
  render: () => <Alert severity="warning">This is a warning alert</Alert>,
};

export const Error: Story = {
  render: () => <Alert severity="error">This is an error alert</Alert>,
};

export const Info: Story = {
  render: () => <Alert severity="info">This is an info alert</Alert>,
};

const iconMapping = {
  error: <div>x</div>,
  warning: <div>!</div>,
  info: <div>i</div>,
  success: <div>✓</div>,
};

export const IconMapping: Story = {
  render: () => (
    <>
      <Alert severity="success" iconMapping={iconMapping}>
        This is a success alert
      </Alert>
      <Alert severity="info" iconMapping={iconMapping}>
        This is an info alert
      </Alert>
      <Alert severity="warning" iconMapping={iconMapping}>
        This is a warning alert
      </Alert>
      <Alert severity="error" iconMapping={iconMapping}>
        This is an error alert
      </Alert>
    </>
  ),
};
