import React from 'react';
import { useForm } from 'react-hook-form';
import type { Meta, StoryObj } from '@storybook/react';
import { Form, TextField } from '../../src/components';

const meta: Meta<typeof TextField> = {
  title: 'components/TextField',
  component: TextField,
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    theme: 'dark',
  },
  decorators: [
    Story => {
      const formContext = useForm();
      const onSubmit = (data: any) => {
        console.log(data);
      };

      return (
        <div style={{ margin: '1rem', maxWidth: '20rem' }}>
          <Form formContext={formContext} onSubmit={onSubmit}>
            <Story />
          </Form>
        </div>
      );
    },
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
