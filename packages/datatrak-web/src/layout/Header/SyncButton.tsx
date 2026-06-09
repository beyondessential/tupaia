import React from 'react';
import { IconButton, useTheme } from '@material-ui/core';
import { RefreshCcw } from 'lucide-react';
import styled from 'styled-components';

import { RouterLink } from '@tupaia/ui-components';

import { ROUTES } from '../../constants/url';

export const StyledSyncButton = styled(IconButton)<{
  component: React.ElementType;
  to: string;
}>`
  padding: 0.5rem;
`;

export const SyncButton = () => {
  const secondaryColor = useTheme().palette.secondary.main;

  return (
    <StyledSyncButton to={ROUTES.SYNC} component={RouterLink}>
      <RefreshCcw size={25} color={secondaryColor} />
    </StyledSyncButton>
  );
};
