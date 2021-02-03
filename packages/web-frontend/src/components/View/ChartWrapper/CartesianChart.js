/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import {
  AreaChart,
  BarChart,
  Brush,
  ComposedChart,
  Legend,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import { CHART_BLUES, TUPAIA_ORANGE, DARK_BLUE, VALUE_TYPES } from '../constants';
import { isMobile, formatDataValue } from '../utils';
import { VIEW_CONTENT_SHAPE } from '../propTypes';
import { CHART_TYPES } from './chartTypes';
import ReferenceLabel from './ReferenceLabel';
import CustomTooltip from './Tooltip';
import { BarChart as BarChartComponent } from './BarChart';
import { LineChart as LineChartComponent } from './LineChart';
import { AreaChart as AreaChartComponent } from './AreaChart';
import { XAxis as XAxisComponent } from './XAxis';
import { YAxes } from './YAxes';

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

// Used to layer line charts on top of bar charts for composed charts.
const CHART_SORT_ORDER = {
  [LINE]: 0,
  [BAR]: 1,
};

const CHART_TYPE_TO_COMPONENT = {
  [AREA]: AreaChart,
  [BAR]: BarChart,
  [COMPOSED]: ComposedChart,
  [LINE]: LineChart,
};

const DEFAULT_DATA_KEY = 'value';

const LEGEND_ALL_DATA_KEY = 'LEGEND_ALL_DATA_KEY';

const LEGEND_ALL_DATA = {
  color: '#FFFFFF',
  label: 'All',
  stackId: 1,
};

/**
 * Cartesian Chart types using recharts
 * @see https://recharts.org
 *
 * Ideally, we would want to extract the various chart subcomponents (Axis, Legend etc)
 * to independent components to isolate their behavior. Unfortunately, for some reason recharts
 * does not work with wrapped components, so we just render everything here
 */

export const CartesianChart = ({ viewContent, isEnlarged, isExporting }) => {
  const [chartConfig, setChartConfig] = useState(viewContent.chartConfig || {});
  const [activeDataKeys, setActiveDataKeys] = useState([]);

  const onLegendClick = event => {
    const legendDatakey = event.dataKey;
    const actionWillSelectAllKeys =
      activeDataKeys.length + 1 >=
        Object.keys(chartConfig).filter(key => key !== LEGEND_ALL_DATA_KEY)(chartConfig).length &&
      !activeDataKeys.includes(legendDatakey);

    if (legendDatakey === LEGEND_ALL_DATA_KEY || actionWillSelectAllKeys) {
      setActiveDataKeys([]);
      return;
    }

    // Note, may be false even if the dataKey is active
    if (activeDataKeys.includes(legendDatakey)) {
      setActiveDataKeys(state => state.activeDataKeys.filter(dk => dk !== legendDatakey));
    } else {
      setActiveDataKeys(state => [...state.activeDataKeys, legendDatakey]);
    }
  };

  const getIsActiveKey = legendDatakey =>
    activeDataKeys.length === 0 ||
    activeDataKeys.includes(legendDatakey) ||
    legendDatakey === LEGEND_ALL_DATA_KEY;

  const updateChartConfig = hasDisabledData => {
    const newChartConfig = { ...chartConfig };

    if (hasDisabledData && !chartConfig[LEGEND_ALL_DATA_KEY]) {
      const allChartType = Object.values(chartConfig)[0].chartType || chartType || 'line';
      newChartConfig[LEGEND_ALL_DATA_KEY] = { ...LEGEND_ALL_DATA, chartType: allChartType };
      setChartConfig(newChartConfig);
    } else if (!hasDisabledData && chartConfig[LEGEND_ALL_DATA_KEY]) {
      delete newChartConfig[LEGEND_ALL_DATA_KEY];
      setChartConfig(newChartConfig);
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

  const formatLegend = (value, { color }) => {
    const isActive = getIsActiveKey(value);
    const displayColor = isActive ? color : color;
    // const displayColor = isActive ? color : getInactiveColor(color);
    return (
      <span style={{ color: displayColor, textDecoration: isActive ? '' : 'line-through' }}>
        {chartConfig[value].label || value}
      </span>
    );
  };

  const renderReferenceLineForAverage = () => {
    const { valueType, data, presentationOptions } = viewContent;
    // show reference line by default
    const shouldHideReferenceLine = presentationOptions && presentationOptions.hideAverage;
    // average is null for stacked charts that don't have a "value" key in data
    const average = data.reduce((acc, row) => acc + row.value, 0) / data.length;

    if (!average || shouldHideReferenceLine) {
      return null;
    }
    return (
      <ReferenceLine
        y={average}
        stroke={TUPAIA_ORANGE}
        label={
          <ReferenceLabel
            value={`Average ${formatDataValue(average, valueType)}`}
            fill={TUPAIA_ORANGE}
          />
        }
        isAnimationActive={isEnlarged && !isExporting}
      />
    );
  };

  const renderReferenceLineLabel = referenceLineLabel => {
    if (referenceLineLabel === undefined) return null;
    return (
      <ReferenceLabel value={`${referenceLineLabel}`} fill={isExporting ? '#000000' : '#ffffff'} />
    );
  };

  const renderReferenceLineForValues = () => {
    const referenceLines = Object.entries(chartConfig)
      .filter(([, { referenceValue }]) => referenceValue)
      .map(([dataKey, { referenceValue, yAxisOrientation, referenceLabel }]) => ({
        key: `reference_line_${dataKey}`, // Use prefix to distinguish from curve key
        y: referenceValue,
        yAxisId: orientationToYAxisId(yAxisOrientation),
        referenceLineLabel: referenceLabel,
      }));

    return referenceLines.map(referenceLine => (
      <ReferenceLine
        stroke={isExporting ? '#000000' : '#ffffff'}
        strokeDasharray="3 3"
        label={renderReferenceLineLabel(referenceLine.referenceLineLabel)}
        {...referenceLine}
      />
    ));
  };

  const {
    chartType,
    data,
    valueType,
    labelType,
    presentationOptions,
    renderLegendForOneItem,
    referenceAreas,
  } = viewContent;

  const hasDataSeries = chartConfig && Object.keys(chartConfig).length > 1;
  const Chart = CHART_TYPE_TO_COMPONENT[chartType];
  const aspect = !isEnlarged && !isMobile() && !isExporting ? 1.6 : undefined;

  const config = Object.keys(chartConfig).length > 0 ? chartConfig : { [DEFAULT_DATA_KEY]: {} };
  const { chartType: defaultChartType } = viewContent;

  const sortedChartConfig = Object.entries(config).sort((a, b) => {
    return CHART_SORT_ORDER[b[1].chartType] - CHART_SORT_ORDER[a[1].chartType];
  });

  return (
    <ResponsiveContainer width="100%" height={isExporting ? 320 : undefined} aspect={aspect}>
      <Chart
        data={filterDisabledData(data)}
        margin={isExporting ? { left: 20, right: 20, top: 20, bottom: 20 } : undefined}
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
              chartType={chartType}
            />
          }
        />
        {(hasDataSeries || renderLegendForOneItem) && isEnlarged && (
          <Legend
            onClick={onLegendClick}
            formatter={formatLegend}
            verticalAlign={isExporting ? 'top' : 'bottom'}
            wrapperStyle={isExporting ? { top: '-20px' } : {}}
          />
        )}
        {sortedChartConfig
          .filter(([, { hideFromLegend }]) => !hideFromLegend)
          .map(([dataKey, { chartT = defaultChartType }]) => {
            const yAxisOrientation = get(chartConfig, [dataKey, 'yAxisOrientation']);
            const yAxisId = orientationToYAxisId(yAxisOrientation);

            // Render bar
            if (chartT === BAR) {
              return BarChartComponent({
                valueType,
                isEnlarged,
                isExporting,
                dataKey,
                chartConfig,
                data,
              });
            }

            // Render area
            if (chartT === AREA) {
              return AreaChartComponent({
                ...chartConfig[dataKey],
                dataKey,
                yAxisId,
                chartConfig,
                data,
              });
            }

            // Render line
            if (chartT === LINE) {
              return LineChartComponent({
                ...chartConfig[dataKey],
                dataKey,
                yAxisId,
                chartConfig,
                data,
              });
            }
          })}
        {chartType === BAR ? renderReferenceLineForAverage() : renderReferenceLineForValues()}
        {chartType === BAR && data.length > 20 && !isExporting && (
          <Brush dataKey="name" height={20} stroke={CHART_BLUES[0]} fill={CHART_BLUES[1]} />
        )}
      </Chart>
    </ResponsiveContainer>
  );
};

CartesianChart.propTypes = {
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE),
};

CartesianChart.defaultProps = {
  isEnlarged: false,
  isExporting: false,
  viewContent: null,
};
