/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Add } from '@material-ui/icons';
import { PageContainer as BasePageContainer, Button } from '../../components';
import { CreateTaskModal, TaskPageHeader, TasksTable } from '../../features';

const PageContainer = styled(BasePageContainer)`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-block-start: 0.75rem;
  padding-block-end: 2rem;
  padding-inline: 3rem;
`;

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
    <PageContainer>
      <TaskPageHeader title="Tasks">
        <ButtonContainer>
          <CreateButton onClick={toggleCreateModal}>
            <AddIcon /> Create Task
          </CreateButton>
        </ButtonContainer>
      </TaskPageHeader>
      <TasksTable />
      <CreateTaskModal open={createModalOpen} onClose={toggleCreateModal} />
    </PageContainer>
  );
};
