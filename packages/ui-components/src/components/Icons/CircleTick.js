/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import BaseIcon from './BaseIcon';

const StyledSVG = styled(BaseIcon)`
  path {
    fill: none;
    stroke: currentColor;
  }
`;

export const CircleTick = () => (
  <StyledSVG viewBox="0 0 41 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path
        d="M10.25 23.4888L14.4354 29.4338C14.76 29.9121 15.2896 30.2025 15.8704 30.2367C16.4513 30.2538 16.9979 29.9975 17.3567 29.5363L30.75 12.5554"
        stroke="#08C95C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.5 40.6062C31.1088 40.6062 39.7188 31.9962 39.7188 21.3875C39.7188 10.7787 31.1088 2.1687 20.5 2.1687C9.89125 2.1687 1.28125 10.7787 1.28125 21.3875C1.28125 31.9962 9.89125 40.6062 20.5 40.6062Z"
        stroke="#08C95C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </StyledSVG>
);
