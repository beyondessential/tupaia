import React from 'react';
import { Navigate, useLocation } from 'react-router';
import styled from 'styled-components';

import { SafeAreaColumn } from '@tupaia/ui-components';

import { useIsDesktop } from '../../utils';
import { MenuList } from './MenuList';
import { ROUTES } from '../../constants';

export const MobileUserMenuRoot = styled(SafeAreaColumn).attrs({ as: 'article' })`
  block-size: 100dvb;
  inline-size: 100%;
  font-size: 1.125rem;
`;

export const MobileUserMenu = (
  props: React.ComponentPropsWithoutRef<typeof MobileUserMenuRoot>,
) => {
  // `useBottomNavigationVisibility` is more semantically appropriate, but it uses `useIsMobile`
  // under the hood, which incorrectly returns false while it’s still evaluating. Here, that would
  // invoke the redirect before the return value of `useBottomNavigationVisibility` settles.
  const isDesktop = useIsDesktop();
  const { pathname } = useLocation();

  if (isDesktop) {
    return <Navigate to={ROUTES.HOME} replace state={{ from: pathname }} />;
  }

  return (
    <MobileUserMenuRoot {...props}>
      <MenuList />
    </MobileUserMenuRoot>
  );
};
