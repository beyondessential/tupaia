/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { EnvBanner } from '@tupaia/ui-components';
import { TopBar } from './TopBar';

const Container = styled.div`
  position: fixed;
  z-index: 1299; // MUI popover index - 1
  flex-direction: column;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
  pointer-events: visiblePainted; /* IE 9-10 doesn't have auto */
  pointer-events: none;
  display: flex; /* Took me ages to find this, is the magic touch */
  align-items: stretch;
  align-content: stretch;
  overflow-y: hidden;
  height: 100%;

  svg.recharts-surface {
    overflow: visible;
  }
`;

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Container>
      <EnvBanner />
      <TopBar />
      {children}
    </Container>
  );
};
