/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';
import { PageContainer as BasePageContainer } from '../components';
import { HeaderLessFullHeightContainer } from './ScrollableLayout';

const PageContainer = styled(BasePageContainer)`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-block-start: 0.75rem;
  padding-block-end: 2rem;
  padding-inline: 3rem;
  max-height: 100%;
  .loading-screen {
    border: none;
    background-color: ${({ theme }) => theme.palette.background.paper};
  }

  ${({ theme }) => theme.breakpoints.down('xs')} {
    padding-inline: 1rem;
  }
`;

export const TasksLayout = () => {
  return (
    <HeaderLessFullHeightContainer>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </HeaderLessFullHeightContainer>
  );
};
