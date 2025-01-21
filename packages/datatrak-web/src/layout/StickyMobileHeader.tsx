import { IconButton, Typography } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { ArrowLeftIcon } from '../components';
import { HEADER_HEIGHT } from '../constants';

export const MobileHeaderWrapper = styled.header`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.background.paper};
  block-size: ${HEADER_HEIGHT};
  display: flex;
  gap: 1rem;
  inline-size: 100%;
  inset-block-start: 0;
  inset-inline-start: 0;
  justify-content: space-between;
  min-block-size: ${HEADER_HEIGHT};
  padding-left: max(env(safe-area-inset-left, 0), 1.25rem);
  padding-right: max(env(safe-area-inset-right, 0), 1.25rem);
  padding-top: env(safe-area-inset-top, 0);
  position: sticky;
  z-index: 1000;
`;

const Button = styled(IconButton)`
  .MuiSvgIcon-root {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

const BackIcon = styled(ArrowLeftIcon)`
  width: 1rem;
  height: 1rem;
`;

const Title = styled(Typography).attrs({ variant: 'h2' })`
  display: inline;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  font-size: 1rem;
  svg {
    vertical-align: middle;
  }
`;

interface StickyMobileHeaderProps extends HTMLAttributes<HTMLDivElement> {
  onBack?: () => void;
  onClose?: (data: any) => void;
}

export const StickyMobileHeader = ({
  children,
  onBack,
  onClick,
  onClose,
  ...props
}: StickyMobileHeaderProps) => {
  return (
    <MobileHeaderWrapper
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? 'Header, click to scroll list back to top' : undefined}
      {...props}
    >
      {onBack && (
        <Button onClick={onBack}>
          <BackIcon />
        </Button>
      )}
      <Title>{children}</Title>
      {onClose && (
        <Button aria-label="Close sync view" onClick={onClose}>
          <Close />
        </Button>
      )}
    </MobileHeaderWrapper>
  );
};
