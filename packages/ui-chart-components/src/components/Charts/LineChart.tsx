import React from 'react';
import { Line, LabelList } from 'recharts';
import { formatDataValueByType } from '@tupaia/utils';
import { LineChartChartConfig } from '@tupaia/types';
import { BLUE, DARK_BLUE } from '../../constants';

interface LineChartProps extends LineChartChartConfig {
  isExporting?: boolean;
  isEnlarged?: boolean;
  exportWithLabels?: boolean;
  dataKey: string;
  yAxisId: number;
}
export const LineChart = ({
  dataKey,
  opacity,
  yAxisId,
  valueType,
  strokeDasharray,
  color,
  isExporting = false,
  isEnlarged = false,
  connectNulls = false,
  exportWithLabels = false,
  dot = true,
}: LineChartProps) => {
  const defaultColor = isExporting ? DARK_BLUE : BLUE;
  const showDot = isExporting ? false : dot; // Always hide when exporting as it doesn't look nice

  return (
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
