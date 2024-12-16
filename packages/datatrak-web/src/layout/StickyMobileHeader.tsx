/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { IconButton, Typography } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import { ArrowLeftIcon } from '../components';
import { HEADER_HEIGHT } from '../constants';
import { Close } from '@material-ui/icons';

export const MobileHeaderWrapper = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.palette.background.paper};
  min-height: ${HEADER_HEIGHT};
  height: ${HEADER_HEIGHT};
  z-index: 1000;
`;

const Button = styled(IconButton)`
  svg {
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
  margin-left: 1rem;
  margin-right: 1rem;
  svg {
    vertical-align: middle;
  }
`;

const ButtonContainer = styled.div`
  width: 3.5rem;
`;

interface StickyMobileHeaderProps {
  title: string | React.ReactNode;
  onBack?: () => void;
  onClose?: (data: any) => void;
  onClick?: () => void;
  className?: string;
}

export const StickyMobileHeader = ({
  onBack,
  title,
  onClose,
  onClick,
  className,
}: StickyMobileHeaderProps) => {
  return (
    <MobileHeaderWrapper
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? 'Header, click to scroll list back to top' : undefined}
      className={className}
    >
      {onBack && (
        <ButtonContainer>
          <Button onClick={onBack}>
            <BackIcon />
          </Button>
        </ButtonContainer>
      )}
      <Title>{title}</Title>
      <ButtonContainer>
        {onClose && (
          <Button onClick={onClose}>
            <Close />
          </Button>
        )}
      </ButtonContainer>
    </MobileHeaderWrapper>
  );
};
