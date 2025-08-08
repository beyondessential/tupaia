import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CheckboxList } from '../../src/components/CheckboxList';

const meta: Meta<typeof CheckboxList> = {
  title: 'components/CheckboxList',
  component: CheckboxList,
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
type Story = StoryObj<typeof CheckboxList>;

const options = [
  {
    label: 'Option 1',
    value: 'option1',
  },
  {
    label: 'Option 2',
    value: 'option2',
  },
];

export const Simple: Story = {
  render: () => <CheckboxList name="test" legend="List of options" options={options} />,
};
