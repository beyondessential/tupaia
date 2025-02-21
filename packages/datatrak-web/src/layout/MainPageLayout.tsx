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
  background-color: ${({ theme }) => theme.palette.background.default};
  min-block-size: 100vb;

  + .notistack-SnackbarContainer {
    inset-block-start: calc(1rem + ${HEADER_HEIGHT} + max(0.0625rem, 1px));
    inset-inline-end: 0;
    max-inline-size: initial;
    padding-left: max(env(safe-area-inset-left, 0), 1.25rem);
    padding-right: max(env(safe-area-inset-right, 0), 1.25rem);

    // Out of the box, notistack does this at 600px
    @media (min-width: 25rem) {
      align-items: flex-end;
    }

    ${({ theme }) => theme.breakpoints.down('md')} {
      inset-block-end: 3.5rem;
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
    ROUTES.ACCOUNT_SETTINGS,
    ROUTES.SURVEY_SELECT,
    ROUTES.SYNC,
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
