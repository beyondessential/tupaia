/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import styled from 'styled-components';
import { PageContainer as BasePageContainer } from '../components';
import { HEADER_HEIGHT, TITLE_BAR_HEIGHT } from '../constants';
import { StickyMobileHeader } from './StickyMobileHeader.tsx';
import { useIsMobile } from '../utils';

const HeaderLessFullHeightContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    height: calc(100vh - ${HEADER_HEIGHT} - ${TITLE_BAR_HEIGHT});
  }
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
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const onClose = () => {
    navigate('/');
  };
  return (
    <HeaderLessFullHeightContainer>
      {isMobile && <StickyMobileHeader onBack={onClose} title="View all tasks" />}
      <PageContainer>
        <Outlet />
      </PageContainer>
    </HeaderLessFullHeightContainer>
  );
};
