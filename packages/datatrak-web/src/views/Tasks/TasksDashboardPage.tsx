import React, { useState } from 'react';
import styled from 'styled-components';
import { Add } from '@material-ui/icons';
import { useNavigate } from 'react-router';
import { Button } from '../../components';
import { CreateTaskModal, TaskPageHeader, TasksTable } from '../../features';
import { StickyMobileHeader, TasksContentWrapper } from '../../layout';
import { TaskMetrics } from '../../features/Tasks/TaskMetrics';
import { useIsMobile } from '../../utils';

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

const ContentWrapper = styled(TasksContentWrapper)`
  overflow: hidden;
`;

export const TasksDashboardPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const onBack = () => {
    navigate(-1);
  };
  const toggleCreateModal = () => setCreateModalOpen(!createModalOpen);
  return (
    <>
      {isMobile && (
        <StickyMobileHeader title="Tasks" onBack={onBack}>
          All tasks
        </StickyMobileHeader>
      )}
      <TaskPageHeader title="Tasks" backTo="/">
        {!isMobile && <TaskMetrics />}
        {!isMobile && (
          <CreateButton onClick={toggleCreateModal}>
            <AddIcon /> Create task
          </CreateButton>
        )}
      </TaskPageHeader>
      <ContentWrapper>
        <TasksTable />
        {createModalOpen && <CreateTaskModal onClose={toggleCreateModal} />}
      </ContentWrapper>
    </>
  );
};
