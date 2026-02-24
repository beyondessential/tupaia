import { Alert, styled } from '@mui/material';
import React, { ComponentPropsWithoutRef } from 'react';

const StyledAlert = styled(Alert)<{ backgroundColor?: string }>`
  background-color: ${props => props.backgroundColor ?? props.theme.palette.grey[900]};
  border-radius: 0;
  color: ${props => props.theme.palette.common.white};
  color-scheme: only dark;
  .MuiAlert-icon {
    color: ${props => props.theme.palette.common.white};
  }
`;

export function BannerNotification(
  props: ComponentPropsWithoutRef<typeof StyledAlert> & { backgroundColor?: string },
) {
  return <StyledAlert icon={false} {...props} />;
}
