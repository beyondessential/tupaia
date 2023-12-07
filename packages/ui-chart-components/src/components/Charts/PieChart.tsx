/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect, MouseEvent } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { formatDataValueByType } from '@tupaia/utils';
import {
  PieChart as BasePieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  LegendProps,
} from 'recharts';
import { PieChartConfig } from '@tupaia/types';
import { OFF_WHITE, CHART_COLOR_PALETTE } from '../../constants';
import { getPieLegend } from '../Reference/Legend';
import { isMobile } from '../../utils';
import { TooltipContainer } from '../Reference';
import { ViewContent, LegendPosition, PresentationOptions } from '../../types';

const Heading = styled(Typography)`
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1rem;
  margin-bottom: 0.5rem;
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

const makeCustomTooltip = (viewContent: ViewContent) => ({ active, payload }: TooltipProps) => {
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

const makeLabel = (viewContent: ViewContent) => ({ payload }: any) => {
  return getFormattedValue(viewContent, payload.payload);
};

const chartColorAtIndex = (colorArray: string[], index: number) =>
  colorArray[index % colorArray.length];

const getHeight = (isExporting: boolean, isEnlarged: boolean, isMobileSize: boolean) => {
  if (isExporting) {
    return 420;
  }
  return isEnlarged && isMobileSize ? 320 : undefined;
};

interface PieChartProps {
  viewContent: ViewContent;
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
  const { presentationOptions, data } = viewContent;
  // eslint-disable-next-line no-unused-vars
  const [, setLoaded] = useState(false);

  const isMobileSize = isMobile(isExporting);

  // Trigger rendering of the chart to fix an issue with the legend overlapping the chart.
  // This is a work around for a recharts bug. @see https://github.com/recharts/recharts/issues/511
  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 50);
  }, []);

  const handleMouseEnter = (event: MouseEvent, index: number) => {
    setActiveIndex(index);
  };

  const handleMouseOut = () => {
    setActiveIndex(-1);
  };

  const getPresentationOption = (key: keyof PresentationOptions | string, option: string) =>
    !!presentationOptions &&
    presentationOptions.hasOwnProperty(key) &&
    presentationOptions[key as keyof PresentationOptions][option];

  const getValidData = () =>
    data
      .filter(({ value }) => {
        if (typeof value === 'number') return value > 0;
        return parseFloat(value) > 0;
      })
      .map(item => {
        const { name, ...otherKeyValues } = item;
        // Map names to labels if available
        let label = getPresentationOption(name, 'label');
        if (!label) label = name;

        return {
          name: label,
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
          onClick={item => {
            onItemClick(item.originalItem);
          }}
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
              getPresentationOption(entry.originalItem.name, 'color') ||
              chartColorAtIndex(chartColors, index);
            return <Cell key={`cell-${index}`} fill={fill} stroke={OFF_WHITE} />;
          })}
        </Pie>
        <Tooltip content={makeCustomTooltip(viewContent)} />
        <Legend
          layout={layout as LegendProps['layout']}
          verticalAlign={verticalAlign as LegendProps['verticalAlign']}
          align={align as LegendProps['align']}
          content={getPieLegend({
            chartConfig: viewContent.chartConfig as PieChartConfig,
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
