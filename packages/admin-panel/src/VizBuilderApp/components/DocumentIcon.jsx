import React from 'react';
import { css } from 'styled-components';

export const DocumentIcon = props => (
  <svg
    width={60}
    height={70}
    viewBox="0 0 60 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <style>
      {css`
        .a {
          stroke: white;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke-linecap: square;
        }
      `}
    </style>
    <path
      d="M3 70H57C58.6569 70 60 68.6569 60 67V16L44.2857 0H3C1.34315 0 0 1.34315 0 3V67C0 68.6569 1.34315 70 3 70Z"
      fill="#C203F2"
    />
    <path opacity="0.2" d="M44 16H60L44 0V16Z" fill="#2C3236" />
    <path className="a" d="M23.9062 39.4688H19.0312V45.9688H23.9062V39.4688Z" />
    <path className="a" d="M32.0312 31.75H27.1562V45.9688H32.0312V31.75Z" />
    <path className="a" d="M40.9688 24.0312H36.0938V45.9688H40.9688V24.0312Z" />
  </svg>
);
