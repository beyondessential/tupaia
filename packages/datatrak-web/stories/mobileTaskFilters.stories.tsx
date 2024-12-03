/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import styled from 'styled-components';
import { MobileTaskFilters } from '../src/features/Tasks/TasksTable/MobileTaskFilters';

const Container = styled.div`
  position: relative;
  background: #f0f0f0;
  border-radius: 10px;
  width: 500px;
  height: 800px;
  max-height: 90vh;
  max-width: 90vw;
`;

const meta: Meta<typeof MobileTaskFilters> = {
  title: 'components/MobileTaskFilters',
  component: MobileTaskFilters,
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MobileTaskFilters>;

export const Simple: Story = {
  render: () => <MobileTaskFilters />,
};
