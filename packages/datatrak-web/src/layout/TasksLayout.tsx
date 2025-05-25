import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';

import { LoadingScreen, SafeAreaColumn } from '@tupaia/ui-components';

import { useIsMobile } from '../utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-block-start: 0.75rem;
  max-height: 100%;
  ${LoadingScreen} {
    border: none;
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
`;

export const TasksContentWrapper = styled(SafeAreaColumn)`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const TasksLayout = () => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Container>
        <Outlet />
      </Container>
    );
  }

  return (
    <Container>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </Container>
  );
};
