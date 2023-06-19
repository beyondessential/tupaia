/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TextField } from '../../src/components/TextField';

const meta: Meta<typeof TextField> = {
  title: 'components/TextField',
  component: TextField,
  decorators: [
    Story => (
      <div style={{ margin: '1rem', maxWidth: '20rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Simple: Story = {
  render: () => <TextField name="name" label="Name" />,
};

export const HelperText: Story = {
  render: () => (
    <TextField name="firstName" label="First name" helperText="Please enter your first name" />
  ),
};

export const TextArea: Story = {
  render: () => <TextField name="firstName" label="First name" multiline rows={4} />,
};

export const Validation: Story = {
  render: () => (
    <TextField
      name="email"
      label="Email"
      type="email"
      error
      helperText="Email is a required field"
    />
  ),
};
