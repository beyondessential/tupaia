import AddRoundedIcon from '@mui/icons-material/AddRounded';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { Button } from '../../components';
import { CreateTaskModal, TaskPageHeader, TasksTable } from '../../features';
import { TaskMetrics } from '../../features/Tasks/TaskMetrics';
import { TasksContentWrapper } from '../../layout';

import { isFeatureEnabled } from '@tupaia/utils';

import { StickyMobileHeader } from '../../layout';
import { useBottomNavigationVisibility, useIsMobile } from '../../utils';
import { BOTTOM_NAVIGATION_HEIGHT_DYNAMIC } from '../../constants';

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

const ContentWrapper = styled(TasksContentWrapper)<{ $isBottomNavVisible?: boolean }>`
  overflow: hidden;
  ${props =>
    props.$isBottomNavVisible &&
    css`
      padding-bottom: ${BOTTOM_NAVIGATION_HEIGHT_DYNAMIC};
    `}
`;

export const TasksDashboardPage = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const isBottomNavVisible = useBottomNavigationVisibility();
  const toggleCreateModal = () => setCreateModalOpen(!createModalOpen);

  return (
    <>
      {isMobile && <StickyMobileHeader>Tasks</StickyMobileHeader>}
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
      <ContentWrapper $isBottomNavVisible={isBottomNavVisible}>
        <TasksTable />
        {createModalOpen && <CreateTaskModal onClose={toggleCreateModal} />}
      </ContentWrapper>
    </>
  );
};
