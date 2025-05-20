import React from 'react';
import { Outlet, matchPath, useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { NavigationBar } from '../components/NavigationBar';
import { HEADER_HEIGHT, ROUTES } from '../constants';
import { SurveyResponseModal } from '../features';
import { useBottomNavigationBarVisibility, useIsMobile } from '../utils';
import { Header, HeaderRoot } from './Header/Header';
import { MobileHeaderRoot } from './StickyMobileHeader';

const PageWrapper = styled.div`
  background-color: ${props => props.theme.palette.background.default};
  display: flex;
  flex-direction: column;
  min-block-size: 100dvb;

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

const Nav = styled(NavigationBar)`
  inset-block-end: 0;
  inset-inline-end: 0;
  inset-inline-start: 0;
  position: fixed;
`;

const useHeaderVisibility = () => {
  const { pathname } = useLocation();

  const mobileHeaderlessRoutes = [
    `${ROUTES.SURVEY}/*`,
    ROUTES.ACCOUNT_SETTINGS,
    ROUTES.MOBILE_USER_MENU,
    ROUTES.SURVEY_SELECT,
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
  const showBottomNavigation = useBottomNavigationBarVisibility();
  return (
    <PageWrapper>
      {showHeader && <Header />}
      <Outlet />
      {showBottomNavigation && <Nav />}

      <SurveyResponseModal />
    </PageWrapper>
  );
};
