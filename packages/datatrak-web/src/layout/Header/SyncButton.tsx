import { IconButton, useTheme } from '@material-ui/core';
import { RefreshCw } from 'lucide-react';
import React from 'react';
import styled from 'styled-components';

import { RouterLink } from '@tupaia/ui-components';
import { ROUTES } from '../../constants/url';
import { useIsSyncing } from '../../sync/syncStatus';

export const StyledSyncButton = styled(IconButton)<{
  component: React.ElementType;
  to: string;
}>`
  padding: 0.5rem;

  @keyframes --spin-sync-button {
    to {
      transform: rotate(1turn);
    }
  }
`;

export const SyncButton = () => {
  const secondaryColor = useTheme().palette.secondary.main;
  const isSyncing = useIsSyncing();

  return (
    <StyledSyncButton to={ROUTES.SYNC} component={RouterLink}>
      <RefreshCw
        size={25}
        color={secondaryColor}
        style={{ animation: isSyncing ? '--spin-sync-button 1150ms linear infinite' : undefined }}
      />
    </StyledSyncButton>
  );
};
