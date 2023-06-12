/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { EnvBanner } from '@tupaia/ui-components';
import { TopBar } from './TopBar';
import { Outlet } from 'react-router';

/**
 * This is the layout for the entire app, which contains the top bar and the main content. This is used to wrap the entire app content
 */
const Container = styled.div`
  position: fixed;
  flex-direction: column;
  flex-wrap: nowrap;
  width: 100%;
  display: flex;
  align-items: stretch;
  align-content: stretch;
  overflow-y: hidden;
  height: 100%;

  svg.recharts-surface {
    overflow: visible;
  }
`;

export const Layout = () => {
  return (
    <Container>
      <EnvBanner />
      <TopBar />
      <Outlet />
    </Container>
  );
};
