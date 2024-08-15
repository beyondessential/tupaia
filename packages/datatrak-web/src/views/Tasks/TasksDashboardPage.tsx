/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Add } from '@material-ui/icons';
import { Button } from '../../components';
import { CreateTaskModal, TaskPageHeader, TasksTable } from '../../features';

const ButtonContainer = styled.div`
  padding-block-end: 0.5rem;
  margin-block-start: 1rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    margin-inline-start: auto;
    margin-block-start: 0;
  }
`;

const CreateButton = styled(Button).attrs({
  color: 'primary',
  variant: 'outlined',
  size: 'small',
})`
  padding-inline-end: 1.2rem;
  // the icon width creates the illusion of more padding on the left, so adjust the padding to compensate
  padding-inline-start: 0.9rem;
`;

const AddIcon = styled(Add)`
  font-size: 1.2rem;
  margin-inline-end: 0.2rem;
`;

export const TasksDashboardPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const toggleCreateModal = () => setCreateModalOpen(!createModalOpen);
  return (
    <>
      <TaskPageHeader title="Tasks">
        <ButtonContainer>
          <CreateButton onClick={toggleCreateModal}>
            <AddIcon /> Create task
          </CreateButton>
        </ButtonContainer>
      </TaskPageHeader>
      <TasksTable />
      {createModalOpen && <CreateTaskModal onClose={toggleCreateModal} />}
    </>
  );
};
