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
  display: grid;
  gap: 1rem;
  grid-template-areas: '--leading --title --trailing';
  grid-template-columns: minmax(3rem, max-content) 1fr minmax(3rem, max-content);
  inline-size: 100%;
  inset-block-start: 0;
  inset-inline-start: 0;
  justify-content: space-between;
  min-block-size: ${HEADER_HEIGHT};
  padding-left: max(env(safe-area-inset-left, 0), 0.2rem);
  padding-right: max(env(safe-area-inset-right, 0), 0.2rem);
  padding-top: env(safe-area-inset-top, 0);
  position: sticky;
  touch-action: pinch-zoom;
  z-index: 1000;
`;

const Button = styled(IconButton)`
  .MuiSvgIcon-root {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;
const LeadingIconButton = styled(Button)`
  grid-area: --leading;
`;
const TrailingIconButton = styled(Button)`
  grid-area: --trailing;
`;

const BackIcon = styled(ArrowLeftIcon)`
  width: 1rem;
  height: 1rem;
`;

const Title = styled(Typography).attrs({ variant: 'h2' })`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  font-size: 1rem;
  grid-area: --title;
  text-align: center;
  overflow: hidden;
`;

interface StickyMobileHeaderProps extends HTMLAttributes<HTMLElement> {
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
        <LeadingIconButton onClick={onBack}>
          <BackIcon />
        </LeadingIconButton>
      )}
      <Title>{children}</Title>
      {onClose && (
        <TrailingIconButton aria-label="Close sync view" onClick={onClose}>
          <Close />
        </TrailingIconButton>
      )}
    </MobileHeaderWrapper>
  );
};
