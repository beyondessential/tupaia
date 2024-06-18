/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { PageContainer as BasePageContainer } from '../../components';
import { TaskPageHeader, TasksTable } from '../../features';

const PageContainer = styled(BasePageContainer)`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-block-start: 0.75rem;
  padding-block-end: 2rem;
  padding-inline: 3rem;
`;

export const TasksDashboardPage = () => {
  return (
    <PageContainer>
      <TaskPageHeader title="Tasks" />
      <TasksTable />
    </PageContainer>
  );
};
