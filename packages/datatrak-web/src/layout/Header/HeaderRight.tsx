import React from 'react';
import styled from 'styled-components';
import { IconButton, useTheme } from '@material-ui/core';
import { RefreshCcw } from 'lucide-react';

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

export const HeaderRight = () => {
  const isOfflineFirst = useIsOfflineFirst();
  const { isLoggedIn } = useCurrentUserContext();
  const secondaryColor = useTheme().palette.secondary.main;

  return (
    <div>
      {isOfflineFirst && isLoggedIn && (
        <SyncButton to={ROUTES.SYNC} component={RouterLink}>
          <RefreshCcw color={secondaryColor}/>
        </SyncButton>
      )}
      <UserMenu />
    </div>
  );
};
