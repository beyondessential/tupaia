/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';
import { HEADER_HEIGHT } from '../constants';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - ${HEADER_HEIGHT});
  padding: 3rem 0;
  form p,
  form a,
  .MuiTypography-root.MuiFormControlLabel-label {
    font-size: 0.8125rem;
  }
  .MuiPaper-root {
    max-height: 100%;
    overflow: auto;
    padding: 1rem;
  }
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.sm}px) {
    .MuiPaper-root {
      height: auto;
      padding: 2rem 3rem;
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
