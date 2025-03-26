import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import styled from 'styled-components';
import { MobileAutocomplete } from '../src/features/Tasks/TasksTable/MobileAutocomplete';

const Container = styled.div`
  position: relative;
  background: #f0f0f0;
  border-radius: 10px;
  width: 500px;
  height: 800px;
  max-height: 90vh;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
`;

const queryClient = new QueryClient();

const meta: Meta<typeof MobileAutocomplete> = {
  title: 'components/MobileAutocomplete',
  component: MobileAutocomplete,
  decorators: [
    Story => (
      <QueryClientProvider client={queryClient}>
        <Container>
          <Story />
        </Container>
      </QueryClientProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MobileAutocomplete>;

const useData = () => {
  const records = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Michael Brown' },
    { id: '4', name: 'Emily Davis' },
    { id: '5', name: 'Christopher Wilson' },
    { id: '6', name: 'Sarah Johnson' },
    { id: '7', name: 'David Anderson' },
    { id: '8', name: 'Sophia Martinez' },
    { id: '9', name: 'James Taylor' },
    { id: '10', name: 'Olivia Thomas' },
    { id: '11', name: 'Daniel Moore' },
    { id: '12', name: 'Emma White' },
    { id: '13', name: 'Matthew Harris' },
    { id: '14', name: 'Ava Thompson' },
    { id: '15', name: 'Anthony Jackson' },
    { id: '16', name: 'Isabella Martin' },
    { id: '17', name: 'Andrew Lee' },
    { id: '18', name: 'Mia Garcia' },
    { id: '19', name: 'Joshua Perez' },
    { id: '20', name: 'Charlotte Clark' },
    { id: '21', name: 'Alexander Lewis' },
    { id: '22', name: 'Amelia Robinson' },
    { id: '23', name: 'Ryan Walker' },
    { id: '24', name: 'Abigail Hall' },
    { id: '25', name: 'Nicholas Young' },
  ];

  return {
    data: records,
    isLoading: false,
  };
};

export const Simple: Story = {
  render: () => {
    const { data = [], isLoading } = useData();

    const options =
      data?.map(user => ({
        ...user,
        value: user.id,
        label: user.name,
      })) ?? [];

    return <MobileAutocomplete options={options} isLoading={isLoading} />;
  },
};
