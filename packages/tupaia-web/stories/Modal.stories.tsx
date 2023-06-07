/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from '@material-ui/core';
import { Modal } from '../src/components/Modal';

const meta: Meta<typeof Modal> = {
  title: 'Modal',
  component: Modal,
  decorators: [
    Story => (
      <div>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Simple: Story = {
  render: () => (
    <Modal open>
      <Typography variant="h3" gutterBottom>
        Lorem ipsum.
      </Typography>
      <Typography variant="body2">
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquam aliquid aperiam commodi
        consequatur cupiditate doloribus earum facere ipsum modi, molestiae, neque, nobis nulla
        perspiciatis qui sint tempora temporibus vel voluptatum!
      </Typography>
    </Modal>
  ),
};
