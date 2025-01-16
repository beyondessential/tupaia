import { IconButton, Typography } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React, { HTMLAttributes } from 'react';
import styled from 'styled-components';

import { ArrowLeftIcon } from '../components';
import { HEADER_HEIGHT } from '../constants';

export const MobileHeaderWrapper = styled.div`
  position: sticky;
  inset-block-start: 0;
  inset-inline-start: 0;
  inline-size: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.palette.background.paper};
  min-block-size: ${HEADER_HEIGHT};
  block-size: ${HEADER_HEIGHT};
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
  margin-inline: 1rem;
  svg {
    vertical-align: middle;
  }
`;

const ButtonContainer = styled.div`
  inline-size: 3.5rem;
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
        <ButtonContainer>
          <Button onClick={onBack}>
            <BackIcon />
          </Button>
        </ButtonContainer>
      )}
      <Title>{children}</Title>
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
