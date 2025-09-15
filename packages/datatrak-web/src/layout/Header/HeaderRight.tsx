import React from 'react';
import styled from 'styled-components';
import { IconButton } from '@material-ui/core';

import { RouterLink } from '@tupaia/ui-components';

import { ROUTES } from '../../constants';
import { UserMenu } from '../UserMenu/UserMenu';
import { useIsMobile } from '../../utils';
import { useCurrentUserContext } from '../../api';

const SyncButton = styled(IconButton)<{
  component: React.ElementType;
  to: string;
}>`
  padding: 0.5rem;
  float: right;
  img {
    max-block-size: 2rem;
  }
`;

export const HeaderRight = () => {
  const isMobile = useIsMobile();
  const { isLoggedIn } = useCurrentUserContext();
  return (
    <div>
      {isMobile && isLoggedIn && (
        <SyncButton to={ROUTES.SYNC} component={RouterLink}>
          <img src="/icons/sync-icon.svg" alt="Tupaia DataTrak – Sync" width="100%" height="100%" />
        </SyncButton>
      )}
      <UserMenu />
    </div>
  );
};
