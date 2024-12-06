/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Outlet, matchPath, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { HEADER_HEIGHT } from '../constants';
import { Header } from '.';
import { MobileAppPrompt, SurveyResponseModal } from '../features';
import { ROUTES } from '../constants';
import { useIsMobile } from '../utils';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.palette.background.default};
  min-height: 100vh;

  + .notistack-SnackbarContainer {
    top: calc(1rem + ${HEADER_HEIGHT});

    ${({ theme }) => theme.breakpoints.down('md')} {
      bottom: 3.5rem;
    }
  }
`;

const useHeaderVisibility = () => {
  const { pathname } = useLocation();
  // Always show header if not mobile
  if (!useIsMobile()) {
    return true;
  }
  // Some routes on mobile don't have header
  const headerLessRoutePatterns = [
    `${ROUTES.SURVEY}/*`,
    ROUTES.SURVEY_SELECT,
    ROUTES.ACCOUNT_SETTINGS,
    ROUTES.TASKS,
    ROUTES.TASK_DETAILS,
  ];

  return !headerLessRoutePatterns.some(pathPattern => matchPath(pathPattern, pathname));
};

export const MainPageLayout = () => {
  const showHeader = useHeaderVisibility();
  return (
    <PageWrapper>
      {showHeader && <Header />}
      <Outlet />
      <MobileAppPrompt />
      <SurveyResponseModal />
    </PageWrapper>
  );
};
