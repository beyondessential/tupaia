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

    ${({ theme }) => theme.breakpoints.down('md')} {
      inset-block-end: 3.5rem;
    }
  }
`;


const useHeaderVisibility = () => {
  const { pathname } = useLocation();

  const mobileHeaderlessRoutes = [
    `${ROUTES.SURVEY}/*`,
    ROUTES.SURVEY_SELECT,
    ROUTES.ACCOUNT_SETTINGS,
    ROUTES.WELCOME,
  ];
  if (useIsMobile()) {
    return !mobileHeaderlessRoutes.some(pathPattern => matchPath(pathPattern, pathname));
  }
  const desktopHeaderlessRoutes = [ROUTES.WELCOME];

  return !desktopHeaderlessRoutes.some(pathPattern => matchPath(pathPattern, pathname));
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
