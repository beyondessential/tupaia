/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { MouseEvent, useEffect, useState } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { formatDataValueByType } from '@tupaia/utils';
import {
  Cell,
  Legend,
  LegendProps,
  Pie,
  PieChart as BasePieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from 'recharts';
import { PieChartSegmentConfig } from '@tupaia/types';
import { CHART_COLOR_PALETTE, OFF_WHITE } from '../../constants';
import { isMobile } from '../../utils';
import { LegendPosition, PieChartViewContent, ViewContent } from '../../types';
import { getPieLegend, TooltipContainer } from '../Reference';

const Heading = styled(Typography)`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;
  margin-block-end: 0.5rem;
  color: #2c3236;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const Box = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 5px;
`;

const Text = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1rem;
  color: #333;
`;

const getLegendAlignment = (legendPosition: LegendPosition, isExporting: boolean) => {
  if (isExporting) {
    return { verticalAlign: 'top', align: 'right', layout: 'vertical' };
  }
  if (legendPosition === 'bottom') {
    return { verticalAlign: 'bottom', align: 'center' };
  }
  return { verticalAlign: 'top', align: 'left' };
};

const getFormattedValue = (viewContent: ViewContent, data: any) => {
  const { valueType, labelType } = viewContent;
  const valueTypeForLabel = labelType || valueType;
  const { name, value, originalItem } = data;
  const metadata = originalItem[`${name}_metadata`];

  return formatDataValueByType({ value, metadata }, valueTypeForLabel);
};

const makeCustomTooltip =
  (viewContent: ViewContent) =>
  ({ active, payload }: TooltipProps) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    const data = payload[0].payload;
    const { name, fill } = data;

    return (
      <TooltipContainer>
        <Heading>{name}</Heading>
        <Item>
          <Box style={{ background: fill }} />
          <Text>{getFormattedValue(viewContent, data)}</Text>
        </Item>
      </TooltipContainer>
    );
  };

const makeLabel = (viewContent: ViewContent) => {
  return ({ payload }: any) => getFormattedValue(viewContent, payload.payload);
};

const getHeight = (isExporting: boolean, isEnlarged: boolean, isMobileSize: boolean) => {
  if (isExporting) return 420;
  if (isEnlarged && isMobileSize) return 320;
  return undefined;
};

interface PieChartProps {
  viewContent: PieChartViewContent;
  isEnlarged?: boolean;
  isExporting?: boolean;
  onItemClick?: (item: any) => void;
  legendPosition?: LegendPosition;
}
export const PieChart = ({
  viewContent,
  isExporting = false,
  isEnlarged = false,
  onItemClick = () => {},
  legendPosition = 'bottom',
}: PieChartProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const { data } = viewContent;
  const segmentConfig = 'segmentConfig' in viewContent ? viewContent.segmentConfig : undefined;
  const presentationOptions =
    'presentationOptions' in viewContent ? viewContent.presentationOptions : undefined;
  const [, setLoaded] = useState(false);

  const isMobileSize = isMobile(isExporting);

  // Trigger rendering of the chart to fix an issue with the legend overlapping the chart.
  // This is a workaround for a recharts bug. @see https://github.com/recharts/recharts/issues/511
  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 50);
  }, []);

  const handleMouseEnter = (event: MouseEvent, index: number) => setActiveIndex(index);
  const handleMouseOut = () => setActiveIndex(-1);

  const getSegmentConfig = (
    key?: keyof PieChartSegmentConfig,
    option?: keyof PieChartSegmentConfig[string],
  ) => {
    if (!key || !option || !segmentConfig) return undefined;
    return segmentConfig.hasOwnProperty(key) && segmentConfig[key][option];
  };

  const getValidData = () =>
    data
      .filter(({ value }) => {
        if (typeof value === 'number') return value > 0;
        return parseFloat(value) > 0;
      })
      .map(item => {
        const { name, ...otherKeyValues } = item;

        return {
          name: getSegmentConfig(name, 'label') || name, // Map names to labels if available
          ...otherKeyValues,
          originalItem: item,
        };
      })
      .sort((a: any, b: any) => b.value - a.value);

  const chartColors = Object.values(CHART_COLOR_PALETTE);
  const validData = getValidData();

  // Due to the way the container margins stack, the pie chart renders
  // about 20px below the visual center when displaying in enlarged mode.
  // This makes the tooltips touch the bottom of the container
  // (and just looks a bit weird). So, bump it up by 20px.
  const offsetStyle =
    isEnlarged && !isMobileSize && !isExporting ? { position: 'relative' } : undefined;
  const responsiveStyle = !isEnlarged && !isMobileSize && !isExporting ? 1.6 : undefined;
  const height = getHeight(isExporting, isEnlarged, isMobileSize);

  const { layout, verticalAlign, align } = getLegendAlignment(legendPosition, isExporting);

  return (
    <ResponsiveContainer width="100%" height={height} aspect={responsiveStyle}>
      <BasePieChart style={offsetStyle}>
        <Pie
          dataKey="value"
          data={validData}
          activeIndex={isExporting ? undefined : activeIndex}
          isAnimationActive={!isExporting && isEnlarged}
          onClick={item => onItemClick(item.originalItem)}
          label={
            isExporting && presentationOptions?.exportWithLabels
              ? makeLabel(viewContent)
              : undefined
          }
          startAngle={360 + 90}
          endAngle={90}
        >
          {validData.map((entry, index) => {
            const fill =
              getSegmentConfig(entry.originalItem.name, 'color') ||
              chartColors[index % chartColors.length];
            return <Cell key={`cell-${index}`} fill={fill} stroke={OFF_WHITE} />;
          })}
        </Pie>
        <Tooltip content={makeCustomTooltip(viewContent)} />
        <Legend
          layout={layout as LegendProps['layout']}
          verticalAlign={verticalAlign as LegendProps['verticalAlign']}
          align={align as LegendProps['align']}
          content={getPieLegend({
            isEnlarged,
            isExporting,
            legendPosition,
            viewContent,
          })}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseOut}
        />
      </BasePieChart>
    </ResponsiveContainer>
  );
};
