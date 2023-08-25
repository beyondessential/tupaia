/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';
import { Header } from '.';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.palette.background.default};
  min-height: 100vh;
`;

export const MainPageLayout = () => {
  return (
    <PageWrapper>
      <Header />
      <Outlet />
    </PageWrapper>
  );
};
