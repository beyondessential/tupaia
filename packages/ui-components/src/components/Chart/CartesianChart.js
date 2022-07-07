/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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

import { CHART_BLUES, CHART_TYPES, VIEW_CONTENT_SHAPE, DEFAULT_DATA_KEY } from './constants';
import { ChartTooltip as CustomTooltip } from './ChartTooltip';
import { BarChart as BarChartComponent } from './BarChart';
import { LineChart as LineChartComponent } from './LineChart';
import { AreaChart as AreaChartComponent } from './AreaChart';
import { getCartesianLegend } from './Legend';
import { isMobile } from './utils';
import { XAxis as XAxisComponent } from './XAxis';
import { YAxes } from './YAxes';
import { ReferenceLines } from './ReferenceLines';

const { AREA, BAR, COMPOSED, LINE } = CHART_TYPES;

// Orientation of the axis is used as an alias for its id
const Y_AXIS_IDS = {
  left: 0,
  right: 1,
};

const DEFAULT_Y_AXIS = {
  id: Y_AXIS_IDS.left,
  orientation: 'left',
  yAxisDomain: {
    min: { type: 'number', value: 0 },
    max: { type: 'string', value: 'auto' },
  },
};

const orientationToYAxisId = orientation => Y_AXIS_IDS[orientation] || DEFAULT_Y_AXIS.id;

const LEGEND_ALL_DATA_KEY = 'LEGEND_ALL_DATA_KEY';

const LEGEND_ALL_DATA = {
  color: '#FFFFFF',
  label: 'All',
  stackId: 1,
};

const CHART_TYPE_TO_CONTAINER = {
  [AREA]: AreaChart,
  [BAR]: BarChart,
  [COMPOSED]: ComposedChart,
  [LINE]: LineChart,
};

const CHART_TYPE_TO_CHART = {
  [AREA]: AreaChartComponent,
  [BAR]: BarChartComponent,
  [COMPOSED]: BarChartComponent,
  [LINE]: LineChartComponent,
};

const getRealDataKeys = chartConfig =>
  Object.keys(chartConfig).filter(key => key !== LEGEND_ALL_DATA_KEY);

const getLegendAlignment = (legendPosition, isExporting) => {
  if (isExporting) {
    return { verticalAlign: 'top', align: 'right', layout: 'vertical' };
  }
  if (legendPosition === 'bottom') {
    return { verticalAlign: 'bottom', align: 'center' };
  }
  return { verticalAlign: 'top', align: 'left' };
};

const getHeight = (isExporting, isEnlarged, hasLegend) => {
  if (isExporting) {
    return 500;
  }
  return isEnlarged && hasLegend && isMobile() ? 320 : undefined;
};

const getMargin = (isExporting, isEnlarged) => {
  if (isExporting) {
    return { left: 20, right: 20, top: 20, bottom: 60 };
  }

  if (isEnlarged) {
    return { left: 0, right: 0, top: 0, bottom: 20 };
  }

  return { left: 0, right: 0, top: 0, bottom: 0 };
};

/**
 * Cartesian Chart types using recharts
 * @see https://recharts.org
 */
export const CartesianChart = ({ viewContent, isEnlarged, isExporting, legendPosition }) => {
  const [chartConfig, setChartConfig] = useState(viewContent.chartConfig || {});
  const [activeDataKeys, setActiveDataKeys] = useState([]);
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

  const getIsActiveKey = legendDatakey =>
    activeDataKeys.length === 0 ||
    activeDataKeys.includes(legendDatakey) ||
    legendDatakey === LEGEND_ALL_DATA_KEY;

  const updateChartConfig = hasDisabledData => {
    const newChartConfig = { ...chartConfig };

    if (hasDisabledData && !chartConfig[LEGEND_ALL_DATA_KEY]) {
      const allChartType = Object.values(chartConfig)[0].chartType || defaultChartType || 'line';
      newChartConfig[LEGEND_ALL_DATA_KEY] = { ...LEGEND_ALL_DATA, chartType: allChartType };
      setChartConfig(newChartConfig);
    } else if (!hasDisabledData && chartConfig[LEGEND_ALL_DATA_KEY]) {
      delete newChartConfig[LEGEND_ALL_DATA_KEY];
      setChartConfig(newChartConfig);
    }
  };

  const onLegendClick = legendDatakey => {
    const actionWillSelectAllKeys =
      activeDataKeys.length + 1 >= getRealDataKeys(chartConfig).length &&
      !activeDataKeys.includes(legendDatakey);

    if (legendDatakey === LEGEND_ALL_DATA_KEY || actionWillSelectAllKeys) {
      setActiveDataKeys([]);
      return;
    }

    // Note, may be false even if the dataKey is active
    if (activeDataKeys.includes(legendDatakey)) {
      setActiveDataKeys(activeDataKeys.filter(dk => dk !== legendDatakey));
    } else {
      setActiveDataKeys([...activeDataKeys, legendDatakey]);
    }
  };

  const filterDisabledData = data => {
    // Can't disable data without chartConfig
    if (!Object.keys(chartConfig).length === 0) return data;

    const hasDisabledData = activeDataKeys.length >= 1;
    updateChartConfig(hasDisabledData, viewContent);

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
        reverseStackOrder={isExporting === true}
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
        {defaultChartType === BAR && data.length > 20 && !isExporting && isEnlarged && (
          <Brush dataKey="name" height={20} stroke={CHART_BLUES[0]} fill={CHART_BLUES[1]} />
        )}
      </ChartContainer>
    </ResponsiveContainer>
  );
};

CartesianChart.propTypes = {
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE),
  legendPosition: PropTypes.string,
};

CartesianChart.defaultProps = {
  isEnlarged: false,
  isExporting: false,
  viewContent: null,
  legendPosition: 'bottom',
};
