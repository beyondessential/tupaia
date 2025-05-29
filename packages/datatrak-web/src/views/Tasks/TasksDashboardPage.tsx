import React, { useState } from 'react';
import styled from 'styled-components';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { Button } from '../../components';
import { CreateTaskModal, TaskPageHeader, TasksTable } from '../../features';
import { TasksContentWrapper } from '../../layout';
import { TaskMetrics } from '../../features/Tasks/TaskMetrics';

const ButtonContainer = styled.div`
  padding-block-end: 0.5rem;
  margin-block-start: 1rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    margin-inline-start: auto;
    margin-block-start: 0;
    padding-block-end: 0;
  }
  ${({ theme }) => theme.breakpoints.down('xs')} {
    align-self: self-end;
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

const ContentWrapper = styled(TasksContentWrapper)`
  overflow: hidden;
`;

export const TasksDashboardPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const toggleCreateModal = () => setCreateModalOpen(!createModalOpen);
  return (
    <>
      <TaskPageHeader title="Tasks" backTo="/">
        <TaskMetrics />
        <ButtonContainer>
          <CreateButton onClick={toggleCreateModal} startIcon={<AddRoundedIcon />}>
            Create task
          </CreateButton>
        </ButtonContainer>
      </TaskPageHeader>
      <ContentWrapper>
        <TasksTable />
        {createModalOpen && <CreateTaskModal onClose={toggleCreateModal} />}
      </ContentWrapper>
    </>
  );
};
