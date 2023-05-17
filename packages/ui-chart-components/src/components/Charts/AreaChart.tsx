/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Area } from 'recharts';
import { BLUE } from '../../constants';

interface AreaChartProps {
  color?: string;
  dataKey: string;
  yAxisId: string | number;
  isEnlarged?: boolean;
  isExporting?: boolean;
}

export const AreaChart: React.FC<AreaChartProps> = ({
  color = BLUE,
  dataKey,
  yAxisId,
  isEnlarged = false,
  isExporting = false,
}) => (
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
