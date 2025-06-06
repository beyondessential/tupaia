import AddRoundedIcon from '@mui/icons-material/AddRounded';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { Button } from '../../components';
import { CreateTaskModal, TaskPageHeader, TasksTable } from '../../features';
import { TaskMetrics } from '../../features/Tasks/TaskMetrics';
import { TasksContentWrapper } from '../../layout';

import { isFeatureEnabled } from '@tupaia/utils';

import { ROUTES } from '../../constants';
import { StickyMobileHeader } from '../../layout';
import { useIsMobile } from '../../utils';

const canCreateTaskOnMobile = isFeatureEnabled('DATATRAK_MOBILE_CREATE_TASK');

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
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const onBack = () => navigate(ROUTES.HOME);
  const toggleCreateModal = () => setCreateModalOpen(!createModalOpen);
  return (
    <>
      {isMobile && <StickyMobileHeader onBack={onBack}>Tasks</StickyMobileHeader>}
      <TaskPageHeader title="Tasks" backTo="/">
        {(!isMobile || canCreateTaskOnMobile) && (
          <>
            {!isMobile && <TaskMetrics style={{ marginInlineEnd: 'auto' }} />}
            <CreateButton onClick={toggleCreateModal} startIcon={<AddRoundedIcon />}>
              Create task
            </CreateButton>
          </>
        )}
      </TaskPageHeader>
      <ContentWrapper>
        <TasksTable />
        {createModalOpen && <CreateTaskModal onClose={toggleCreateModal} />}
      </ContentWrapper>
    </>
  );
};
