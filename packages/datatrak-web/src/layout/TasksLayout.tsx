/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';
import { PageContainer as BasePageContainer } from '../components';

const PageContainer = styled(BasePageContainer)`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-block-start: 0.75rem;
  padding-block-end: 2rem;
  padding-inline: 3rem;
`;

export const TasksLayout = () => {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
};
