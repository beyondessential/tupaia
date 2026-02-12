import { Alert, styled } from '@mui/material';
import React from 'react';

interface BannerNotificationProps {
  message: React.ReactNode;
}

const StyledAlert = styled(Alert)`
  background-color: ${props => props.theme.palette.grey[900]};
  border-radius: 0;
  color-scheme: only dark;
  color: ${props => props.theme.palette.common.white};

  .MuiAlert-icon {
    color: ${props => props.theme.palette.common.white};
  }
`;

export function BannerNotification({ message }: BannerNotificationProps) {
  return <StyledAlert icon={false}>{message}</StyledAlert>;
}
