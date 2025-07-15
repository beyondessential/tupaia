import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';

import { SafeArea } from '@tupaia/ui-components';

import { HEADER_HEIGHT } from '../constants';

export const CenteredLayoutRoot = styled(SafeArea).attrs({
  bottom: true,
  left: true,
  right: true,
})`
  align-items: center;
  block-size: calc(100dvb - 2 * ${HEADER_HEIGHT});
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  width: 100%;
  box-sizing: border-box;

  form p,
  form a,
  .MuiTypography-root.MuiFormControlLabel-label {
    font-size: 0.8125rem;
  }
  .MuiPaper-root {
    overflow: auto;
    padding: 1rem;
    height: auto;
    max-height: 100%;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  ${({ theme }) => theme.breakpoints.up('sm')} {
    .MuiPaper-root {
      padding: 2rem 3rem;
    }
  }
  
  /* Ensure proper centering on mobile */
  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    padding-left: 0;
    padding-right: 0;
    .MuiPaper-root {
      margin: 0 auto;
    }
  }
`;

export const CentredLayout = () => {
  return (
    <CenteredLayoutRoot>
      <Outlet />
    </CenteredLayoutRoot>
  );
};
