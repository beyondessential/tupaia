import React, { useMemo } from 'react';
import styled from 'styled-components';
import { formatDataValueByType } from '@tupaia/utils';
import {
  PieChart as BasePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  Text as RechartText,
  LabelProps,
} from 'recharts';
import { ChartReport, GaugeChartConfig } from '@tupaia/types';
import { BLUE, TRANS_BLACK, WHITE } from '../../constants';
import { isMobile } from '../../utils';

interface GaugeChartProps {
  config: GaugeChartConfig;
  report: ChartReport;
  isEnlarged?: boolean;
  isExporting?: boolean;
  onItemClick?: (item: any) => void;
}

const Text = styled(RechartText)<{ $isExporting: boolean }>`
  font-size: ${({ fontSize }) => fontSize};
  font-weight: bold;
  fill: ${({ theme, $isExporting }) => {
    return theme.palette.type === 'light' || $isExporting ? TRANS_BLACK : WHITE;
  }};
`;

const getHeight = (isExporting?: boolean, isEnlarged?: boolean, isMobileSize?: boolean) => {
  if (isExporting) {
    return 420;
  }
  return isEnlarged && isMobileSize ? 320 : undefined;
};

export const GaugeChart = ({
  config,
  report,
  isExporting = false,
  isEnlarged = false,
  onItemClick = () => {},
}: GaugeChartProps) => {
  const { color = BLUE, ...restOfConfigs } = config;
  const { data = [] } = report;
  const isMobileSize = isMobile(isExporting);

  const generateElements = () => {
    const denominator = 0.05;
    const elements = [...data];
    const cellComponents = [<Cell fill={color} />];
    const numOfElements = Math.floor((1 - (data[0].value as number)) / denominator);

    for (let i = 0; i < numOfElements; i++) {
      elements.push({ value: denominator });
      cellComponents.push(<Cell key={`cell-${i}`} fill="#eaeaea" />);
    }

    return { elements, cellComponents };
  };

  const { elements, cellComponents } = useMemo(() => generateElements(), [data]);
  const height = useMemo(
    () => getHeight(isExporting, isEnlarged, isMobileSize),
    [isExporting, isEnlarged, isMobileSize],
  );

  const responsiveStyle = isEnlarged || isMobileSize || isExporting ? 1.5 : 1;
  const innerRadius = 60 * responsiveStyle;
  const outerRadius = innerRadius * 1.4;

  const getLabelContent = ({ value, x, y, fontSize }: LabelProps) => {
    return (
      <Text
        x={x}
        y={y}
        verticalAnchor="middle"
        textAnchor="middle"
        fontSize={fontSize}
        $isExporting={isExporting}
      >
        {value}
      </Text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height} aspect={isMobileSize ? undefined : 2}>
      <BasePieChart>
        <Pie
          cy="70%"
          startAngle={180}
          endAngle={0}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey="value"
          data={elements}
          paddingAngle={2}
          isAnimationActive={!isExporting && isEnlarged}
          onClick={item => {
            onItemClick(item.originalItem);
          }}
          {...restOfConfigs}
        >
          {cellComponents}
          {/* Coordinate graph for Gauge chart: https://beyond-essential.slab.com/posts/gauge-chart-2f6rrxnj#h5p3r-how-to-add-labels-into-pie-chart-in-rechart */}
          {/* Value label on the center */}
          <Label
            content={props =>
              getLabelContent({
                x: props.viewBox.cx,
                y: props.viewBox.cy,
                value: formatDataValueByType({ value: elements[0].value }, 'percentage'),
                fontSize: 30,
              })
            }
          />
          {/* 0 label on the left */}
          <Label
            content={props => {
              const fontSize = 15;
              return getLabelContent({
                x: props.viewBox.cx - outerRadius + (outerRadius - innerRadius) / 2,
                y: props.viewBox.cy + fontSize,
                value: 0,
                fontSize,
              });
            }}
          />
          {/* 100% label on the right */}
          <Label
            content={props => {
              const fontSize = 15;
              return getLabelContent({
                x: props.viewBox.cx + outerRadius - (outerRadius - innerRadius) / 2,
                y: props.viewBox.cy + fontSize,
                value: '100%',
                fontSize,
              });
            }}
          />
        </Pie>
      </BasePieChart>
    </ResponsiveContainer>
  );
};
