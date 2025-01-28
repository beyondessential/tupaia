import React, { SVGAttributes } from 'react';
import styled from 'styled-components';
import BaseIcon from './BaseIcon';

const StyledSVG = styled(BaseIcon)`
  path {
    fill: none;
    stroke: currentColor;
  }
`;

export const Home = (props: SVGAttributes<HTMLOrSVGElement>) => (
  <StyledSVG {...props} viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path
        d="M2.88171 7.06396V11.5886H6.13171V8.29797C6.13171 7.84276 6.49463 7.4753 6.94421 7.4753H7.75671C8.2063 7.4753 8.56921 7.84276 8.56921 8.29797V11.5886H11.8192V7.06396"
        stroke="#9CC7E9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.25671 6.24127L6.7763 0.6526C7.09588 0.329016 7.61046 0.329016 7.92463 0.6526L13.4442 6.24127"
        stroke="#9CC7E9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.78796 2.53922V1.71655H11.8192V4.59589"
        stroke="#9CC7E9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </StyledSVG>
);
