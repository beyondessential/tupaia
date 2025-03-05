import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';
import { PageContainer as BasePageContainer } from '../components';
import { HEADER_HEIGHT, TITLE_BAR_HEIGHT } from '../constants';

const HeaderLessFullHeightContainer = styled.div`
  height: calc(100vh - ${HEADER_HEIGHT} - ${TITLE_BAR_HEIGHT});
  display: flex;
  flex-direction: column;
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
  padding-inline: 2.7rem;
  flex: 1;
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.breakpoints.down('xs')} {
    padding-inline: 0.6rem;
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
