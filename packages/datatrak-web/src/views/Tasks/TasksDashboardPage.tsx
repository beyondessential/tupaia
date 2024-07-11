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
  margin-inline-start: auto;
  padding-block-end: 0.5rem;
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
      <CreateTaskModal open={createModalOpen} onClose={toggleCreateModal} />
    </>
  );
};
