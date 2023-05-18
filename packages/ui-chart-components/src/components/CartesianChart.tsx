/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import get from 'lodash.get';
import {
  AreaChart,
  BarChart,
  ComposedChart,
  LineChart,
  Legend,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  Brush,
} from 'recharts';
import { BaseChartConfig } from '@tupaia/types';
import { CHART_BLUES, DEFAULT_DATA_KEY } from '../constants';
import { ChartType, ViewContent, LegendPosition } from '../types';
import {
  BarChart as BarChartComponent,
  LineChart as LineChartComponent,
  AreaChart as AreaChartComponent,
} from './Charts';
import { getCartesianLegend, ReferenceLines, ChartTooltip as CustomTooltip } from './Reference';
import { isMobile } from '../utils';
import { XAxis as XAxisComponent, YAxes } from './Axes';

const { Area, Bar, Composed, Line } = ChartType;

// Orientation of the axis is used as an alias for its id
enum Y_AXIS_IDS {
  left = 0,
  right = 1,
}

const DEFAULT_Y_AXIS = {
  id: Y_AXIS_IDS.left,
  orientation: 'left',
  yAxisDomain: {
    min: { type: 'number', value: 0 },
    max: { type: 'string', value: 'auto' },
  },
};

const orientationToYAxisId = (orientation: 'left' | 'right'): number =>
  Y_AXIS_IDS[orientation] || DEFAULT_Y_AXIS.id;

const LEGEND_ALL_DATA_KEY = 'LEGEND_ALL_DATA_KEY';

const LEGEND_ALL_DATA = {
  color: '#FFFFFF',
  label: 'All',
  stackId: 1,
};

const CHART_TYPE_TO_CONTAINER = {
  [Area]: AreaChart,
  [Bar]: BarChart,
  [Composed]: ComposedChart,
  [Line]: LineChart,
};

const CHART_TYPE_TO_CHART = {
  [Area]: AreaChartComponent,
  [Bar]: BarChartComponent,
  [Composed]: BarChartComponent,
  [Line]: LineChartComponent,
};

const getRealDataKeys = (chartConfig: BaseChartConfig | {}) =>
  Object.keys(chartConfig).filter(key => key !== LEGEND_ALL_DATA_KEY);

const getLegendAlignment = (legendPosition: LegendPosition, isExporting: boolean) => {
  if (isExporting) {
    return { verticalAlign: 'top', align: 'right', layout: 'vertical' };
  }
  if (legendPosition === 'bottom') {
    return { verticalAlign: 'bottom', align: 'center' };
  }
  return { verticalAlign: 'top', align: 'left' };
};

const getHeight = (isExporting: boolean, isEnlarged: boolean, hasLegend: boolean) => {
  if (isExporting) {
    return 500;
  }
  return isEnlarged && hasLegend && isMobile() ? 320 : undefined;
};

const getMargin = (isExporting: boolean, isEnlarged: boolean) => {
  if (isExporting) {
    return { left: 20, right: 20, top: 20, bottom: 60 };
  }

  if (isEnlarged) {
    return { left: 0, right: 0, top: 0, bottom: 20 };
  }

  return { left: 0, right: 0, top: 0, bottom: 0 };
};

interface CartesianChartProps {
  viewContent: ViewContent;
  legendPosition: LegendPosition;
  isEnlarged?: boolean;
  isExporting?: boolean;
}

export const CartesianChart: React.FC<CartesianChartProps> = ({
  viewContent,
  isEnlarged = false,
  isExporting = false,
  legendPosition = 'bottom',
}) => {
  const [chartConfig, setChartConfig] = useState<BaseChartConfig | object>(
    viewContent.chartConfig || {},
  );
  const [activeDataKeys, setActiveDataKeys] = useState<string[]>([]);
  // eslint-disable-next-line no-unused-vars
  const [_, setLoaded] = useState(false);

  // Trigger rendering of the chart to fix an issue with the legend overlapping the chart.
  // This is a work around for a recharts bug. @see https://github.com/recharts/recharts/issues/511
  useEffect(() => {
    setTimeout(() => {
      setLoaded(true);
    }, 50);
  }, []);

  const {
    chartType: defaultChartType,
    data,
    valueType,
    labelType,
    presentationOptions,
    renderLegendForOneItem,
    referenceAreas,
  } = viewContent;

  const getIsActiveKey = (legendDataKey: string) =>
    activeDataKeys.length === 0 ||
    activeDataKeys.includes(legendDataKey) ||
    legendDataKey === LEGEND_ALL_DATA_KEY;

  const updateChartConfig = (hasDisabledData: boolean) => {
    const newChartConfig = { ...chartConfig };

    if (hasDisabledData && !chartConfig.hasOwnProperty(LEGEND_ALL_DATA_KEY)) {
      const allChartType = Object.values(chartConfig)[0].chartType || defaultChartType || 'line';
      newChartConfig[LEGEND_ALL_DATA_KEY] = { ...LEGEND_ALL_DATA, chartType: allChartType };
      setChartConfig(newChartConfig);
    } else if (!hasDisabledData && chartConfig.hasOwnProperty(LEGEND_ALL_DATA_KEY)) {
      delete newChartConfig[LEGEND_ALL_DATA_KEY];
      setChartConfig(newChartConfig);
    }
  };

  const onLegendClick = (legendDataKey: string) => {
    const actionWillSelectAllKeys =
      activeDataKeys.length + 1 >= getRealDataKeys(chartConfig).length &&
      !activeDataKeys.includes(legendDataKey);

    if (legendDataKey === LEGEND_ALL_DATA_KEY || actionWillSelectAllKeys) {
      setActiveDataKeys([]);
      return;
    }

    // Note, may be false even if the dataKey is active
    if (activeDataKeys.includes(legendDataKey)) {
      setActiveDataKeys(activeDataKeys.filter(dk => dk !== legendDataKey));
    } else {
      setActiveDataKeys([...activeDataKeys, legendDataKey]);
    }
  };

  const filterDisabledData = (data: object[]) => {
    // Can't disable data without chartConfig
    if (Object.keys(chartConfig).length === 0) {
      return data;
    }

    const hasDisabledData = activeDataKeys.length >= 1;
    updateChartConfig(hasDisabledData);

    return hasDisabledData
      ? data.map(dataSeries =>
          Object.entries(dataSeries).reduce((newDataSeries, [key, value]) => {
            const isInactive = Object.keys(chartConfig).includes(key) && !getIsActiveKey(key);
            return isInactive ? newDataSeries : { ...newDataSeries, [key]: value };
          }, {}),
        )
      : data;
  };

  const ChartContainer = CHART_TYPE_TO_CONTAINER[defaultChartType];
  const hasDataSeries = chartConfig && Object.keys(chartConfig).length > 1;
  const chartDataConfig =
    Object.keys(chartConfig).length > 0 ? chartConfig : { [DEFAULT_DATA_KEY]: {} };
  const hasLegend = hasDataSeries || renderLegendForOneItem;
  const aspect = !isEnlarged && !isMobile() && !isExporting ? 1.6 : undefined;
  const height = getHeight(isExporting, isEnlarged, hasLegend);

  /**
   * Unfortunately, recharts does not work with wrapped components called as jsx for some reason,
   * so they are called as functions below
   */
  return (
    <ResponsiveContainer width="100%" height={height} aspect={aspect}>
      <ChartContainer
        data={filterDisabledData(data)}
        margin={getMargin(isExporting, isEnlarged)}
        reverseStackOrder={isExporting}
      >
        {referenceAreas && referenceAreas.map(areaProps => <ReferenceArea {...areaProps} />)}
        {XAxisComponent({ isEnlarged, isExporting, viewContent })}
        {YAxes({ viewContent, chartDataConfig, isExporting, isEnlarged })}
        <Tooltip
          filterNull={false}
          content={
            <CustomTooltip
              valueType={valueType}
              labelType={labelType}
              periodGranularity={viewContent.periodGranularity}
              chartConfig={chartConfig}
              presentationOptions={presentationOptions}
              chartType={defaultChartType}
            />
          }
        />
        {hasLegend && isEnlarged && (
          <Legend
            {...getLegendAlignment(legendPosition, isExporting)}
            content={getCartesianLegend({
              chartConfig,
              getIsActiveKey,
              isExporting,
              onClick: onLegendClick,
              legendPosition,
            })}
          />
        )}
        {Object.entries(chartDataConfig)
          .filter(([, { hideFromLegend }]) => !hideFromLegend)
          .map(([dataKey, { chartType = defaultChartType }]) => {
            const Chart = CHART_TYPE_TO_CHART[chartType];
            const yAxisOrientation = get(chartConfig, [dataKey, 'yAxisOrientation']);
            const yAxisId = orientationToYAxisId(yAxisOrientation);

            return Chart({
              valueType,
              ...chartConfig[dataKey],
              chartConfig,
              dataKey,
              isExporting,
              isEnlarged,
              yAxisId,
              data,
              exportWithLabels: presentationOptions?.exportWithLabels,
            });
          })}
        {ReferenceLines({ viewContent, isExporting, isEnlarged })}
        {defaultChartType === Bar && data.length > 20 && !isExporting && isEnlarged && (
          <Brush
            dataKey="name"
            height={20}
            stroke={CHART_BLUES['blue1']}
            fill={CHART_BLUES['blue2']}
          />
        )}
      </ChartContainer>
    </ResponsiveContainer>
  );
};
