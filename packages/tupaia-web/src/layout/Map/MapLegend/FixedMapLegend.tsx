/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';

// Placeholder for legend
const FixedMapLegendWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: center;
  position: absolute;
  background-color: grey;
  width: 300px;
  height: 50px;
  bottom: 1em;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 5px;
  @media screen and (max-width: ${({ theme }) => theme.mobile.threshold}) {
    display: none;
  }
`;

export const FixedMapLegend = () => {
  return <FixedMapLegendWrapper />;
};
