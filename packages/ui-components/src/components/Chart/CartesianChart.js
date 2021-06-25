/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
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

import { CHART_BLUES, CHART_TYPES, VIEW_CONTENT_SHAPE } from './constants';
import { Tooltip as CustomTooltip } from './Tooltip';
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

const DEFAULT_DATA_KEY = 'value';

const LEGEND_ALL_DATA_KEY = 'LEGEND_ALL_DATA_KEY';

const LEGEND_ALL_DATA = {
  color: '#FFFFFF',
  label: 'All',
  stackId: 1,
};

// Used to layer line charts on top of bar charts for composed charts.
const CHART_SORT_ORDER = {
  [LINE]: 0,
  [BAR]: 1,
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

/**
 * Cartesian Chart types using recharts
 * @see https://recharts.org
 */
export const CartesianChart = ({ viewContent, isEnlarged, isExporting, legendPosition }) => {
  const [chartConfig, setChartConfig] = useState(viewContent.chartConfig || {});
  const [activeDataKeys, setActiveDataKeys] = useState([]);

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

  const hasDataSeries = chartConfig && Object.keys(chartConfig).length > 1;
  const aspect = !isEnlarged && !isMobile() && !isExporting ? 1.6 : undefined;

  const config = Object.keys(chartConfig).length > 0 ? chartConfig : { [DEFAULT_DATA_KEY]: {} };

  const sortedChartConfig = Object.entries(config).sort((a, b) => {
    return CHART_SORT_ORDER[b[1].chartType] - CHART_SORT_ORDER[a[1].chartType];
  });

  const ChartContainer = CHART_TYPE_TO_CONTAINER[defaultChartType];

  /**
   * Unfortunately, recharts does not work with wrapped components called as jsx for some reason,
   * so they are called as functions below
   */
  return (
    <ResponsiveContainer width="100%" height={isExporting ? 320 : undefined} aspect={aspect}>
      <ChartContainer
        data={filterDisabledData(data)}
        margin={
          isExporting
            ? { left: 20, right: 20, top: 20, bottom: 20 }
            : { left: 0, right: 0, top: 0, bottom: 20 }
        }
      >
        {referenceAreas && referenceAreas.map(areaProps => <ReferenceArea {...areaProps} />)}
        {XAxisComponent({ isEnlarged, isExporting, viewContent })}
        {YAxes({ viewContent, isExporting })}
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
        {(hasDataSeries || renderLegendForOneItem) && isEnlarged && (
          <Legend
            verticalAlign={legendPosition === 'bottom' ? 'bottom' : 'top'}
            align={legendPosition === 'bottom' ? 'center' : 'left'}
            content={getCartesianLegend({
              chartConfig,
              getIsActiveKey,
              isExporting,
              onClick: onLegendClick,
              legendPosition,
            })}
          />
        )}
        {sortedChartConfig
          .filter(([, { hideFromLegend }]) => !hideFromLegend)
          .map(([dataKey, { chartType = defaultChartType }]) => {
            const Chart = CHART_TYPE_TO_CHART[chartType];
            const yAxisOrientation = get(chartConfig, [dataKey, 'yAxisOrientation']);
            const yAxisId = orientationToYAxisId(yAxisOrientation);

            return Chart({
              ...chartConfig[dataKey],
              chartConfig,
              dataKey,
              isExporting,
              isEnlarged,
              yAxisId,
              data,
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
