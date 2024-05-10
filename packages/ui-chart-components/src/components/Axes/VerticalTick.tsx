/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

const truncate = (str: string, num: number, ellipsis = false): string => {
  if (str.length <= num) {
    return str;
  }
  return ellipsis ? `${str.slice(0, num)}...` : str.slice(0, num);
};

interface VerticalTickProps {
  x: number;
  y: number;
  payload: {
    value: string;
  };
}

export const VerticalTick = ({ x, y, payload }: VerticalTickProps) => {
  const stringVal =
    payload.value !== undefined && payload.value !== null ? String(payload.value) : '';
  return (
    <g transform={`translate(${x - 5},${y + 3})`}>
      <text
        fontSize="13px"
        transform="rotate(305)"
        textAnchor="end"
        fill="#333"
        className="recharts-text recharts-cartesian-axis-tick-value"
      >
        {truncate(stringVal, 25, true)}
      </text>
    </g>
  );
};
