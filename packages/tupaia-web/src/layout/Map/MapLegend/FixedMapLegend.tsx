/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { MOBILE_THRESHOLD } from '../../../constants';

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
  @media screen and (max-width: ${MOBILE_THRESHOLD}) {
    display: none;
  }
`;

export const FixedMapLegend = () => {
  return <FixedMapLegendWrapper />;
};
