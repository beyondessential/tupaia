/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Outlet } from 'react-router';
import { Header } from './Header';
import styled from 'styled-components';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
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
