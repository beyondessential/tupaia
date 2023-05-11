/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Area } from 'recharts';
import { BLUE } from '../../constants';

export const AreaChart = ({ color, dataKey, yAxisId, isEnlarged, isExporting }) => (
  <Area
    key={dataKey}
    dataKey={dataKey}
    yAxisId={yAxisId}
    type="monotone"
    stroke={color}
    fill={color}
    isAnimationActive={isEnlarged && !isExporting}
  />
);

AreaChart.propTypes = {
  dataKey: PropTypes.string.isRequired,
  yAxisId: PropTypes.string.isRequired,
  color: PropTypes.string,
  isExporting: PropTypes.bool,
  isEnlarged: PropTypes.bool,
};

AreaChart.defaultProps = {
  color: BLUE,
  isExporting: false,
  isEnlarged: false,
};
