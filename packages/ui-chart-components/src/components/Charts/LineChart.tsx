/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Line, LabelList } from 'recharts';
import { formatDataValueByType } from '@tupaia/utils';
import { BLUE, DARK_BLUE } from '../../constants';

interface LineChartProps {
  dataKey: string;
  opacity?: string;
  yAxisId: string | number;
  valueType: string;
  color?: string;
  isExporting?: boolean;
  isEnlarged?: boolean;
  connectNulls?: boolean;
  exportWithLabels?: boolean;
  strokeDasharray?: string;
  dot?: boolean;
}

export const LineChart = ({
  dataKey,
  opacity,
  yAxisId,
  valueType,
  strokeDasharray,
  color = BLUE,
  isExporting = false,
  isEnlarged = false,
  connectNulls = false,
  exportWithLabels = false,
  dot = true,
}: LineChartProps) => {
  const defaultColor = isExporting ? DARK_BLUE : BLUE;
  const showDot = isExporting ? false : dot; // Always hide when exporting as it doesn't look nice

  return (
    // @ts-ignore - ts lint is complaining about the children but it is a valid prop in the Line component
    <Line
      key={dataKey}
      type="monotone"
      dataKey={dataKey}
      yAxisId={yAxisId}
      stroke={color || defaultColor}
      strokeWidth={isEnlarged ? 3 : 1}
      strokeOpacity={opacity}
      fill={color || defaultColor}
      connectNulls={connectNulls}
      isAnimationActive={isEnlarged && !isExporting}
      strokeDasharray={strokeDasharray}
      dot={showDot}
    >
      {isExporting && exportWithLabels && (
        <LabelList
          dataKey={dataKey}
          position="insideTopRight"
          offset={-20}
          angle={50}
          formatter={value => formatDataValueByType({ value }, valueType)}
        />
      )}
    </Line>
  );
};
