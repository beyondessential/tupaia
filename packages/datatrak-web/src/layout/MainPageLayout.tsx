import React from 'react';
import { Outlet, matchPath, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { HEADER_HEIGHT, ROUTES } from '../constants';
import { SurveyResponseModal } from '../features';
import { useIsMobile } from '../utils';
import { Header, HeaderRoot } from './Header/Header';
import { MobileHeaderRoot } from './StickyMobileHeader';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.palette.background.default};
  min-block-size: 100vb;

  + .notistack-SnackbarContainer {
    align-items: stretch;
    inline-size: 26rem;
    inset-block-start: 0;
    inset-inline-end: 0;
    max-inline-size: 100%;
    padding-block-start: calc(1rem + max(0.0625rem, 1px));
    padding-left: max(env(safe-area-inset-left, 0), 1.25rem);
    padding-right: max(env(safe-area-inset-right, 0), 1.25rem);

    ${({ theme }) => theme.breakpoints.down('md')} {
      inset-block-end: 3.5rem;
    }
  }

  #root:has(${HeaderRoot}, ${MobileHeaderRoot}) & + .notistack-SnackbarContainer {
    inset-block-start: ${HEADER_HEIGHT};
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
      <SurveyResponseModal />
    </PageWrapper>
  );
};
