import React, { useState } from 'react';
import styled from 'styled-components';
import MuiInfoIcon from '@material-ui/icons/Info';
import { Button } from '@tupaia/ui-components';
import { Typography } from '@material-ui/core';
import { MOBILE_BREAKPOINT } from '../../constants';

const DesktopWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.palette.common.white};
  flex-direction: column;
  position: absolute;
  padding: 1rem;
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) => theme.palette.common.black};
  top: 0;
  left: 0;
  opacity: 0;

  svg {
    font-size: 1.4rem;
  }

  p {
    font-size: 0.9rem;
  }

  &:hover,
  &:focus-visible {
    cursor: auto;
    opacity: 0.9;
    background-color: ${({ theme }) => theme.palette.common.black};
  }

  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const MobileWrapper = styled.div`
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const ExpandButton = styled(Button).attrs({
  variant: 'outlined',
  color: 'default',
})<{
  $active: boolean;
}>`
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  text-transform: none;
  color: ${({ theme }) => theme.palette.text.primary};
  border-color: ${({ theme }) => theme.palette.common.white};
  padding: 0.3rem;
  width: 100%;
  margin-top: 1rem;

  .MuiButton-label span {
    display: ${props => (props.$active ? 'none' : 'flex')};
  }

  .MuiTypography-root {
    display: ${props => (props.$active ? 'block' : 'none')};
    padding: 0.3rem;
  }
`;

interface DashboardInfoHoverProps {
  infoText: string | undefined;
}

export const DashboardInfoHover = ({ infoText }: DashboardInfoHoverProps) => {
  const [isInfoBoxOpen, setIsInfoBoxOpen] = useState(false);

  if (!infoText) return null;

  const toggleInfoBox = () => {
    setIsInfoBoxOpen(!isInfoBoxOpen);
  };

  return (
    <>
      <DesktopWrapper>
        <MuiInfoIcon />
        <Typography>{infoText}</Typography>
      </DesktopWrapper>
      <MobileWrapper>
        <ExpandButton startIcon={<MuiInfoIcon />} onClick={toggleInfoBox} $active={isInfoBoxOpen}>
          <span>View more info</span>
          <Typography>{infoText}</Typography>
        </ExpandButton>
      </MobileWrapper>
    </>
  );
};
