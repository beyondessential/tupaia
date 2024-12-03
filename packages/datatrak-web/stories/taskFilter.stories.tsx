/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../src/components/Button';

const meta: Meta<typeof Button> = {
  title: 'components/CheckboxList',
  component: Button,
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    theme: 'dark',
  },
  decorators: [
    Story => (
      <div style={{ margin: '1rem', maxWidth: '20rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Simple: Story = {
  render: () => <Button>Click me</Button>,
};
