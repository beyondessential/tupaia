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
  height: calc(100% - ${HEADER_HEIGHT});
  p,
  a,
  .MuiTypography-root.MuiFormControlLabel-label {
    font-size: 0.8125rem;
  }
`;

export const AuthLayout = () => {
  return (
    <Wrapper>
      <Outlet />
    </Wrapper>
  );
};
