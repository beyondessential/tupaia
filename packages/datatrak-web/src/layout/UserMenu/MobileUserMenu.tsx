import React from 'react';
import { Navigate, useLocation } from 'react-router';
import styled from 'styled-components';

import { SafeAreaColumn } from '@tupaia/ui-components';

import { ROUTES } from '../../constants';
import { useBottomNavigationVisibility } from '../../utils';
import { MenuList } from './MenuList';

export const MobileUserMenuRoot = styled(SafeAreaColumn).attrs({ as: 'article' })`
  block-size: 100dvb;
  inline-size: 100%;
  font-size: 1.125rem;
`;

export const MobileUserMenu = (
  props: React.ComponentPropsWithoutRef<typeof MobileUserMenuRoot>,
) => {
  const isBottomNavVisible = useBottomNavigationVisibility();
  const { pathname } = useLocation();

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
