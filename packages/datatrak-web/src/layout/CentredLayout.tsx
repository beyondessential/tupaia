/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';
import { HEADER_HEIGHT, MOBILE_HEADER_HEIGHT } from '../constants';

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - ${MOBILE_HEADER_HEIGHT});
  padding: 1rem 1.2rem;
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
  }
  ${({ theme }) => theme.breakpoints.up('sm')} {
    .MuiPaper-root {
      padding: 2rem 3rem;
    }
  }
  ${({ theme }) => theme.breakpoints.up('md')} {
    height: calc(100vh - ${HEADER_HEIGHT});
  }
`;

export const CentredLayout = () => {
  return (
    <Wrapper>
      <Outlet />
    </Wrapper>
  );
};
