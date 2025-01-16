import React, { SVGAttributes } from 'react';
import styled from 'styled-components';
import BaseIcon from './BaseIcon';

const StyledSVG = styled(BaseIcon)`
  path {
    fill: none;
    stroke: currentColor;
  }
`;

export const Clipboard = (props: SVGAttributes<HTMLOrSVGElement>) => (
  <StyledSVG {...props} viewBox="0 0 37 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.0733 7.01721H4.37166C2.98105 7.01721 1.85852 8.13975 1.85852 9.53035V37.1748C1.85852 38.5654 2.98105 39.688 4.37166 39.688H32.0161C33.4067 39.688 34.5293 38.5654 34.5293 37.1748V9.53035C34.5293 8.13975 33.4067 7.01721 32.0161 7.01721H25.3144"
      stroke="#697074"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24.7615 8.6759C24.594 9.19529 24.1081 9.53037 23.5719 9.53037H12.8157C12.2796 9.53037 11.7937 9.17853 11.6262 8.6759L9.95076 3.64964C9.81673 3.26429 9.88374 2.84543 10.1183 2.51035C10.3529 2.17526 10.7382 1.99097 11.1403 1.99097H25.2474C25.6495 1.99097 26.0348 2.19202 26.2694 2.51035C26.5039 2.84543 26.571 3.26429 26.4369 3.64964L24.7615 8.6759Z"
      stroke="#697074"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M29.503 12.0435V28.5966C29.503 29.2668 29.2349 29.9035 28.7658 30.3726L25.2139 33.9245C24.7448 34.3936 24.1081 34.6617 23.4379 34.6617H8.14133C7.45441 34.6617 6.88477 34.092 6.88477 33.4051V12.0435"
      stroke="#697074"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.9636 34.6617V29.6354C21.9636 28.2448 23.0862 27.1223 24.4768 27.1223H29.503"
      stroke="#697074"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </StyledSVG>
);
