/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  p,
  a,
  .MuiTypography-root.MuiFormControlLabel-label {
    font-size: 0.8125rem;
  }
  @media screen and (max-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    .MuiPaper-root {
      height: 100%;
      padding: 1rem;
    }
  }
`;

export const CentredLayout = () => {
  return (
    <Wrapper>
      <Outlet />
    </Wrapper>
  );
};
