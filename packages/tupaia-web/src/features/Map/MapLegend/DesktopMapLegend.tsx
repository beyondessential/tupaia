/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { MOBILE_BREAKPOINT } from '../../../constants';

// Placeholder for legend
const Wrapper = styled.div`
  pointer-events: auto;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  padding: 1rem;
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const Legend = styled.div`
  height: 50px;
  width: 300px;
  background-color: grey;
  border-radius: 5px;
`;

export const DesktopMapLegend = () => {
  return (
    <Wrapper>
      <Legend />
    </Wrapper>
  );
};
