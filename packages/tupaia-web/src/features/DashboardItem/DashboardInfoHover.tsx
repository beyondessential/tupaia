/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiInfoIcon from '@material-ui/icons/Info';
import { MOBILE_BREAKPOINT } from '../../constants';
import { Typography } from '@material-ui/core';

const Wrapper = styled.div`
  text-transform: none;
  font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  cursor: pointer;
  color: ${({ theme }) => theme.palette.common.white};
  border-color: ${({ theme }) => theme.palette.common.white};
  padding: 0.3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 0.3rem;
  margin-top: 1rem;
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    .MuiButton-label {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: ${({ theme }) => theme.palette.common.black};
    border: none;
    top: 0;
    left: 0;
    opacity: 0;
    margin-top: 0;
    &:hover,
    &:focus-visible {
      opacity: 0.9;
      background-color: ${({ theme }) => theme.palette.common.black};
    }
  }
`;

const DashboardInfoHoverText = styled(Typography)`
  font-size: 1rem;
`;

interface DashboardInfoHoverProps {
  infoText: string | undefined;
}

export const DashboardInfoHover = ({ infoText }: DashboardInfoHoverProps) => {
  const content = <DashboardInfoHoverText>{infoText}</DashboardInfoHoverText>;
  return (
    <Wrapper>
      <MuiInfoIcon />
      {!infoText ? null : content}
    </Wrapper>
  );
};
