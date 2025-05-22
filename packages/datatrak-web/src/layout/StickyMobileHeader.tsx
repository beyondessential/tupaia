import { IconButton, Typography } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import ArrowBackIosNewRounded from '@mui/icons-material/ArrowBackIosNewRounded';
import React, { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';

import { HEADER_HEIGHT } from '../constants';

export const MobileHeaderRoot = styled.header`
  align-items: center;
  background-color: ${({ theme }) => theme.palette.background.paper};
  block-size: ${HEADER_HEIGHT};
  border-block-end: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
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

const Title = styled(Typography).attrs({ variant: 'h2' })`
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  font-size: 1rem;
  grid-area: --title;
  text-align: center;
  overflow: hidden;
`;

interface StickyMobileHeaderProps extends ComponentPropsWithoutRef<typeof MobileHeaderRoot> {
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
    <MobileHeaderRoot
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? 'Header, click to scroll list back to top' : undefined}
      {...props}
    >
      {onBack && (
        <LeadingIconButton onClick={onBack}>
          <ArrowBackIosNewRounded />
        </LeadingIconButton>
      )}
      <Title>{children}</Title>
      {onClose && (
        <TrailingIconButton aria-label="Close" onClick={onClose}>
          <Close />
        </TrailingIconButton>
      )}
    </MobileHeaderRoot>
  );
};
