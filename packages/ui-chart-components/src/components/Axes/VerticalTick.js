/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';

const truncate = (str, num, ellipsis = false) => {
  if (str.length <= num) {
    return str;
  }
  return ellipsis ? `${str.slice(0, num)}...` : str.slice(0, num);
};

export const VerticalTick = ({ x, y, payload }) => {
  return (
    <g transform={`translate(${x - 5},${y + 3})`}>
      <text
        fontSize="13px"
        transform="rotate(305)"
        textAnchor="end"
        fill="#333"
        className="recharts-text recharts-cartesian-axis-tick-value"
      >
        {truncate(payload.value, 25, true)}
      </text>
    </g>
  );
};

VerticalTick.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  payload: PropTypes.object.isRequired,
};
