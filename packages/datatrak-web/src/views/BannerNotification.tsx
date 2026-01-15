import React from 'react';
import { Alert, styled } from '@mui/material';

interface BannerNotificationProps {
  message: React.ReactNode | string;
}

const StyledAlert = styled(Alert)`
  background-color: #333333;
  border-radius: 0;
  color: ${({ theme }) => theme.palette.common.white};
  '& .MuiAlert-icon': {
    color: 'white',
  },
`;

export function BannerNotification({ message }: BannerNotificationProps) {
  return <StyledAlert icon={false}>{message}</StyledAlert>;
}
