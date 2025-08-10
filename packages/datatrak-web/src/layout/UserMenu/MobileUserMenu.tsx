import React from 'react';
import { Navigate, useLocation } from 'react-router';
import styled from 'styled-components';

import { SafeAreaColumn } from '@tupaia/ui-components';

import { useCurrentUserContext } from '../../api';
import { useBottomNavigationVisibility } from '../../components/BottomNavigation';
import { BOTTOM_NAVIGATION_HEIGHT_DYNAMIC, ROUTES } from '../../constants';
import { MenuList } from './MenuList';

export const MobileUserMenuRoot = styled(SafeAreaColumn).attrs({ as: 'article' })`
  block-size: 100dvb;
  inline-size: 100%;
  font-size: 1.125rem;
  padding-block-end: ${BOTTOM_NAVIGATION_HEIGHT_DYNAMIC};
  overflow: auto;
`;

export const MobileUserMenu = (
  props: React.ComponentPropsWithoutRef<typeof MobileUserMenuRoot>,
) => {
  const { isLoggedIn } = useCurrentUserContext();
  const isBottomNavVisible = useBottomNavigationVisibility();
  const { pathname } = useLocation();

  if (!isLoggedIn) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: pathname }} />;
  }

  // Wait until hydration so we don’t prematurely redirect
  if (isBottomNavVisible === false) {
    return <Navigate to={ROUTES.HOME} replace state={{ from: pathname }} />;
  }

  return (
    <MobileUserMenuRoot {...props}>
      <MenuList />
    </MobileUserMenuRoot>
  );
};
