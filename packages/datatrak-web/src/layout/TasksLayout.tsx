import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';
import { PageContainer as BasePageContainer } from '../components';
import { useIsMobile } from '../utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-bottom: max(env(safe-area-inset-bottom, 0), 1rem);
`;

const PageContainer = styled(BasePageContainer)`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-block-start: 0.75rem;
  padding-inline: 0.3rem;
  max-height: 100%;
  .loading-screen {
    border: none;
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
`;

export const TasksContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-left: max(env(safe-area-inset-left, 0), 1.25rem);
  padding-right: max(env(safe-area-inset-right, 0), 1.25rem);
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
