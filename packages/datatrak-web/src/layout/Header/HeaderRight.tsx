import React from 'react';
import styled from 'styled-components';
import { IconButton, useTheme } from '@material-ui/core';
import { RefreshCcw } from 'lucide-react';
import { useLocation } from 'react-router';

import { RouterLink } from '@tupaia/ui-components';

import { ROUTES } from '../../constants';
import { UserMenu } from '../UserMenu/UserMenu';
import { useCurrentUserContext } from '../../api';
import { useIsOfflineFirst } from '../../api/offlineFirst';

const SyncButton = styled(IconButton)<{
  component: React.ElementType;
  to: string;
}>`
  padding: 0.5rem;
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const HeaderRight = () => {
  const isOfflineFirst = useIsOfflineFirst();
  const { isLoggedIn } = useCurrentUserContext();
  const secondaryColor = useTheme().palette.secondary.main;
  const location = useLocation();
  const isSyncPage = location.pathname === ROUTES.SYNC;

  return (
    <Wrapper>
      {isOfflineFirst && isLoggedIn && !isSyncPage && (
        <SyncButton to={ROUTES.SYNC} component={RouterLink}>
          <RefreshCcw size={25} color={secondaryColor}/>
        </SyncButton>
      )}
      <UserMenu />
    </Wrapper>
  );
};
