/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { SVGAttributes } from 'react';
import styled from 'styled-components';

const StyledSVG = styled.svg`
  width: 1em;
  height: 1em;
  display: inline-block;
  font-size: 1.2rem;
  transition: fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  flex-shrink: 0;
  user-select: none;
`;

export const ExportIcon = (props: SVGAttributes<HTMLOrSVGElement>) => (
  <StyledSVG {...props} viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.1327 0.275052L10.2359 3.45787C11.1088 4.33728 9.79956 5.65666 8.92639 4.77727L7.864 3.70292C7.62218 3.45837 7.42602 3.53945 7.42602 3.8841V8.16145C7.42602 8.67262 7.01152 9.09196 6.50008 9.09196C5.98975 9.09196 5.57413 8.67535 5.57413 8.16145V3.8841C5.57413 3.54128 5.37806 3.45826 5.13615 3.70292L4.07358 4.77727C3.20072 5.65668 1.8912 4.33728 2.76395 3.45787L5.83547 0.279458C6.19458 -0.0921251 6.77403 -0.0927211 7.13262 0.275105L7.1327 0.275052ZM11.1428 12.8226V10.9578C11.1428 10.4426 11.5586 10.025 12.0714 10.025C12.5843 10.025 13 10.4426 13 10.9578V13.7576C13 14.4451 12.4421 15 11.7618 15H1.2382C0.555082 15 0 14.4414 0 13.7576V10.9578C0 10.4426 0.415718 10.025 0.928575 10.025C1.44143 10.025 1.85715 10.4426 1.85715 10.9578V12.8226C1.85715 12.9983 1.99549 13.1344 2.16608 13.1344H10.8341C11.0046 13.1344 11.143 12.9949 11.143 12.8226H11.1428Z"
      fill={props.fill}
    />
  </StyledSVG>
);
