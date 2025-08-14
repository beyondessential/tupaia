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
import { ChartReport, PieChartConfig, PieChartSegmentConfig } from '@tupaia/types';
import { CHART_COLOR_PALETTE, OFF_WHITE } from '../../constants';
import { isMobile } from '../../utils';
import { LegendPosition } from '../../types';
import { TooltipContainer } from '../Reference';
import { getPieChartLegend } from '../Legend';

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

const getFormattedValue = (config: PieChartConfig, data: any) => {
  const { valueType, labelType } = config;
  const valueTypeForLabel = labelType || valueType;
  const { name, value, originalItem } = data;
  const metadata = originalItem[`${name}_metadata`];

  return formatDataValueByType({ value, metadata }, valueTypeForLabel);
};

const makeCustomTooltip =
  (config: PieChartConfig) =>
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
          <Text>{getFormattedValue(config, data)}</Text>
        </Item>
      </TooltipContainer>
    );
  };

const makeLabel = (config: PieChartConfig) => {
  return ({ payload }: any) => getFormattedValue(config, payload.payload);
};

const getHeight = (isExporting: boolean, isEnlarged: boolean, isMobileSize: boolean) => {
  if (isExporting) return 420;
  if (isEnlarged && isMobileSize) return 320;
  return undefined;
};

interface PieChartProps {
  config: PieChartConfig;
  report: ChartReport;
  isEnlarged?: boolean;
  isExporting?: boolean;
  onItemClick?: (item: any) => void;
  legendPosition?: LegendPosition;
}
export const PieChart = ({
  config,
  report,
  isExporting = false,
  isEnlarged = false,
  onItemClick = () => {},
  legendPosition = 'bottom',
}: PieChartProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const { data } = report;
  const segmentConfig = 'segmentConfig' in config ? config.segmentConfig : undefined;
  const presentationOptions =
    'presentationOptions' in config ? config.presentationOptions : undefined;
  const [, setLoaded] = useState(false);

  const isMobileSize = isMobile(isExporting);

  // Trigger rendering of the chart to fix an issue with the legend overlapping the chart.
  // This is a workaround for a recharts bug. @see https://github.com/recharts/recharts/issues/511
  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 50);
  }, []);

  const handleMouseEnter = (_event: MouseEvent, index: number) => setActiveIndex(index);
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
      ?.filter(({ value }) => {
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
            isExporting && presentationOptions?.exportWithLabels ? makeLabel(config) : undefined
          }
          startAngle={360 + 90}
          endAngle={90}
        >
          {validData?.map((entry, index) => {
            const fill =
              getSegmentConfig(entry.originalItem.name, 'color') ||
              chartColors[index % chartColors.length];
            return <Cell key={`cell-${index}`} fill={fill} stroke={OFF_WHITE} />;
          })}
        </Pie>
        <Tooltip content={makeCustomTooltip(config)} />
        <Legend
          layout={layout as LegendProps['layout']}
          verticalAlign={verticalAlign as LegendProps['verticalAlign']}
          align={align as LegendProps['align']}
          content={getPieChartLegend({
            isEnlarged,
            isExporting,
            legendPosition,
            config,
          })}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseOut}
        />
      </BasePieChart>
    </ResponsiveContainer>
  );
};
