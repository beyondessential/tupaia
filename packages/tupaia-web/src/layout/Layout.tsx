/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { TopBar } from '.';

const Wrapper = styled.div``;

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <Wrapper>
      <TopBar />
      {children}
    </Wrapper>
  );
};
