/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Brush,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Text,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { CHART_BLUES, BLUE, TUPAIA_ORANGE, DARK_BLUE, VALUE_TYPES } from '../constants';
import { isMobile, formatDataValue } from '../utils';
import { VIEW_CONTENT_SHAPE } from '../propTypes';
import { CHART_TYPES } from './chartTypes';
import { formatTimestampForChart, getIsTimeSeries } from './helpers';
import ReferenceLabel from './ReferenceLabel';
import CustomTooltip from './Tooltip';
import VerticalTick from './VerticalTick';

const { AREA, BAR, COMPOSED, LINE } = CHART_TYPES;
const { PERCENTAGE } = VALUE_TYPES;

const AXIS_TIME_PROPS = {
  dataKey: 'timestamp',
  type: 'number',
  scale: 'time',
  domain: ['dataMin', 'dataMax'],
};
const X_AXIS_PADDING = {
  enlarged: {
    dataLengthThreshold: 9,
    base: 20,
    offset: 30,
    minimum: 30,
  },
  preview: {
    dataLengthThreshold: 9,
    base: 4,
    offset: 10,
    minimum: 10,
  },
};
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

const PERCENTAGE_Y_DOMAIN = {
  min: { type: 'number', value: 0 },
  max: { type: 'string', value: 'dataMax' },
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
export const CartesianChart = props => {
  const [xAxisHeight, setXAxisHeight] = useState(0);
  const [chartConfig, setChartConfig] = useState(props.viewContent.chartConfig);
  const [activeDataKeys, setActiveDataKeys] = useState([]);

  const chartTypeToRenderMethod = {
    [AREA]: renderArea,
    [BAR]: renderBar,
    [LINE]: renderLine,
  };

  const isComposedChart = () => {
    const { viewContent } = props;
    return viewContent.chartType === COMPOSED;
  };

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

  const updateChartConfig = (hasDisabledData, viewContent) => {
    const { chartType } = viewContent;
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
    const { viewContent } = props;
    // Can't disable data without chartConfig
    if (!chartConfig) return data;

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

  const getBarSize = () => {
    const { isEnlarged, viewContent } = props;

    if (isComposedChart() || viewContent.data.length === 1) {
      return isEnlarged ? 100 : 50;
    }
    return undefined;
  };

  const getXAxisPadding = () => {
    const { isEnlarged, viewContent } = props;
    const { chartType, data } = viewContent;
    const hasBars =
      chartType === BAR ||
      Object.values(chartConfig).some(({ chartType: composedType }) => composedType === BAR);

    if (hasBars && data.length > 1 && getIsTimeSeries(data)) {
      const paddingKey = isEnlarged ? 'enlarged' : 'preview';
      const { dataLengthThreshold, base, offset, minimum } = X_AXIS_PADDING[paddingKey];
      const padding = Math.max(minimum, (dataLengthThreshold - data.length) * base + offset);
      return { left: padding, right: padding };
    }

    return { left: 0, right: 0 };
  };

  const getXAxisTickMethod = () => {
    const { isEnlarged, isExporting, viewContent } = props;
    const { chartType } = viewContent;

    if (isExporting) {
      return renderVerticalTick;
    }
    return isEnlarged || chartType === BAR ? undefined : renderTickFirstAndLastLabel;
  };

  /*
    If set 0, all the ticks will be shown.
    If set preserveStart", "preserveEnd" or "preserveStartEnd", the ticks which is to be shown or hidden will be calculated automatically.
    @see https://recharts.org/en-US/api/YAxis
  */
  const getXAxisTickInterval = () => {
    const { isEnlarged, isExporting, viewContent } = props;
    const { chartType } = viewContent;

    if (chartType === BAR || chartType === COMPOSED) {
      return isExporting ? 0 : 'preserveStartEnd';
    }

    return isEnlarged ? 'preserveStartEnd' : 0;
  };

  const formatXAxisTick = tickData => {
    const { viewContent } = props;
    const { periodGranularity, data, presentationOptions = {} } = viewContent;
    const { periodTickFormat } = presentationOptions;

    return getIsTimeSeries(data)
      ? formatTimestampForChart(tickData, periodGranularity, periodTickFormat)
      : tickData;
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

  const getDefaultYAxisDomain = () =>
    props.viewContent.valueType === PERCENTAGE ? PERCENTAGE_Y_DOMAIN : DEFAULT_Y_AXIS.yAxisDomain;

  const calculateYAxisDomain = ({ min, max }) => {
    return [parseDomainConfig(min), parseDomainConfig(max)];
  };

  const parseDomainConfig = config => {
    switch (config.type) {
      case 'scale':
        return dataExtreme => dataExtreme * config.value;
      case 'clamp':
        return dataExtreme => {
          const maxClampedVal = config.max ? Math.min(dataExtreme, config.max) : dataExtreme;
          return config.min ? Math.max(maxClampedVal, config.min) : maxClampedVal;
        };
      case 'number':
      case 'string':
      default:
        return config.value;
    }
  };

  const containsClamp = ({ min, max }) => min.type === 'clamp' || max.type === 'clamp';

  const renderVerticalTick = props => {
    const { viewContent } = props;
    const { payload, ...restOfProps } = props;

    return (
      <VerticalTick
        {...restOfProps}
        viewContent={viewContent}
        onHeight={height => {
          if (xAxisHeight < height) {
            setXAxisHeight(height);
            // State isn't fast enough at updating to compare against
            // so always set the instance variable for comparison.
            // xAxisHeight = height;
          }
        }}
        payload={{
          ...payload,
          value: formatXAxisTick(payload.value),
        }}
      />
    );
  };

  const renderTickFirstAndLastLabel = props => {
    const { viewContent } = props;
    const { data } = viewContent;
    const { index, payload } = props;

    // Only render first and last ticks labels, the rest just have a tick mark without text
    if (index === 0 || index === data.length - 1) {
      // See https://github.com/recharts/recharts/blob/master/src/cartesian/CartesianAxis.js#L74
      return (
        <Text {...props} className="recharts-cartesian-axis-tick-value">
          {formatXAxisTick(payload.value)}
        </Text>
      );
    }

    return null;
  };

  const renderXAxis = () => {
    const { isExporting, viewContent } = props;
    const { data } = viewContent;
    const axisProps = getIsTimeSeries(data) ? AXIS_TIME_PROPS : {};

    return (
      <XAxis
        dataKey="name"
        label={data.xName}
        stroke={isExporting ? DARK_BLUE : 'white'}
        height={isExporting ? xAxisHeight + 20 : undefined}
        interval={getXAxisTickInterval()}
        tick={getXAxisTickMethod()}
        tickFormatter={formatXAxisTick}
        padding={getXAxisPadding()}
        {...axisProps}
      />
    );
  };

  const renderYAxes = () => {
    const axisPropsById = {
      [Y_AXIS_IDS.left]: { yAxisId: Y_AXIS_IDS.left, dataKeys: [], orientation: 'left' },
      [Y_AXIS_IDS.right]: { yAxisId: Y_AXIS_IDS.right, dataKeys: [], orientation: 'right' },
    };
    Object.entries(chartConfig).forEach(
      ([dataKey, { yAxisOrientation: orientation, valueType, yAxisDomain }]) => {
        const axisId = Y_AXIS_IDS[orientation] || DEFAULT_Y_AXIS.id;
        axisPropsById[axisId].dataKeys.push(dataKey);
        if (valueType) {
          axisPropsById[axisId].valueType = valueType;
        }
        axisPropsById[axisId].yAxisDomain = yAxisDomain;
      },
    );

    const axesProps = Object.values(axisPropsById).filter(({ dataKeys }) => dataKeys.length > 0);
    // If no custom axes provided, render the  default y axis
    return axesProps.length > 0 ? axesProps.map(renderYAxis) : renderYAxis();
  };

  const renderYAxis = ({
    yAxisId = DEFAULT_Y_AXIS.id,
    orientation = DEFAULT_Y_AXIS.orientation,
    yAxisDomain = getDefaultYAxisDomain(),
    valueType: axisValueType,
  } = {}) => {
    const { isExporting, viewContent } = props;
    const { data, valueType, presentationOptions } = viewContent;

    return (
      <YAxis
        key={yAxisId}
        ticks={viewContent.ticks}
        yAxisId={yAxisId}
        orientation={orientation}
        domain={calculateYAxisDomain(yAxisDomain)}
        allowDataOverflow={valueType === PERCENTAGE || containsClamp(yAxisDomain)}
        // The above 2 props stop floating point imprecision making Y axis go above 100% in stacked charts.
        label={data.yName}
        tickFormatter={value =>
          formatDataValue(value, valueType || axisValueType, { presentationOptions })
        }
        interval={isExporting ? 0 : 'preserveStartEnd'}
        stroke={isExporting ? DARK_BLUE : 'white'}
      />
    );
  };

  const renderTooltip = () => {
    const { viewContent } = props;
    const { chartType, valueType, labelType, presentationOptions } = viewContent;

    return (
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
    );
  };

  const renderLegend = () => {
    const { isEnlarged, viewContent, isExporting } = props;
    const { renderLegendForOneItem } = viewContent;
    const hasDataSeries = chartConfig && Object.keys(chartConfig).length > 1;

    return (
      (hasDataSeries || renderLegendForOneItem) &&
      isEnlarged && (
        <Legend
          onClick={onLegendClick}
          formatter={formatLegend}
          verticalAlign={isExporting ? 'top' : 'bottom'}
          wrapperStyle={isExporting ? { top: '-20px' } : {}}
        />
      )
    );
  };

  const renderReferenceAreas = () => {
    const { viewContent } = props;

    if (!('referenceAreas' in viewContent)) {
      return null;
    }

    return viewContent.referenceAreas.map(areaProps => <ReferenceArea {...areaProps} />);
  };

  const renderReferenceLines = () => {
    const { viewContent } = props;
    const { chartType } = viewContent;

    return chartType === BAR ? renderReferenceLineForAverage() : renderReferenceLineForValues();
  };

  const renderReferenceLineForAverage = () => {
    const { isEnlarged, viewContent, isExporting } = props;
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
    const { isExporting } = props;
    if (referenceLineLabel === undefined) return null;
    return (
      <ReferenceLabel value={`${referenceLineLabel}`} fill={isExporting ? '#000000' : '#ffffff'} />
    );
  };

  const renderReferenceLineForValues = () => {
    const { isExporting } = props;

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

  const renderBrush = () => {
    const { isExporting, viewContent } = props;
    const { chartType, data } = viewContent;
    const hasBigData = data.length > 20;

    return (
      chartType === BAR &&
      hasBigData &&
      !isExporting && (
        <Brush dataKey="name" height={20} stroke={CHART_BLUES[0]} fill={CHART_BLUES[1]} />
      )
    );
  };

  const renderCharts = () => {
    const { viewContent } = props;
    const defaultChartConfig = { [DEFAULT_DATA_KEY]: {} };
    const { chartType: defaultChartType } = viewContent;

    const sortedChartConfig = Object.entries(chartConfig).sort((a, b) => {
      return CHART_SORT_ORDER[b[1].chartType] - CHART_SORT_ORDER[a[1].chartType];
    });

    return sortedChartConfig
      .filter(([, { hideFromLegend }]) => !hideFromLegend)
      .map(([dataKey, { chartType = defaultChartType }]) => {
        const renderMethod = chartTypeToRenderMethod[chartType];
        const yAxisOrientation = get(chartConfig, [dataKey, 'yAxisOrientation']);
        const yAxisId = orientationToYAxisId(yAxisOrientation);

        return renderMethod({ ...chartConfig[dataKey], dataKey, yAxisId });
      });
  };

  const renderArea = ({ color = BLUE, dataKey, yAxisId }) => {
    const { isEnlarged, isExporting } = props;

    return (
      <Area
        key={dataKey}
        dataKey={dataKey}
        yAxisId={yAxisId}
        type="monotone"
        stroke={color}
        fill={color}
        isAnimationActive={isEnlarged && !isExporting}
      />
    );
  };

  const renderBar = ({ color = BLUE, dataKey, yAxisId, stackId }) => {
    const { isEnlarged, isExporting, viewContent } = props;
    const { valueType } = viewContent;
    const labelOffset = chartConfig ? -15 : -12;
    return (
      <Bar
        key={dataKey}
        dataKey={dataKey}
        yAxisId={yAxisId}
        stackId={stackId}
        fill={color}
        isAnimationActive={isEnlarged && !isExporting}
        barSize={getBarSize()}
      >
        {isExporting && !stackId && (
          <LabelList
            dataKey={dataKey}
            position="insideTop"
            offset={labelOffset}
            formatter={value => formatDataValue(value, valueType)}
          />
        )}
      </Bar>
    );
  };

  const renderLine = ({ color, dataKey, yAxisId }) => {
    const { isEnlarged, isExporting, viewContent } = props;
    const { valueType } = viewContent;
    const defaultColor = isExporting ? DARK_BLUE : BLUE;

    return (
      <Line
        key={dataKey}
        type="monotone"
        dataKey={dataKey}
        yAxisId={yAxisId}
        stroke={color || defaultColor}
        strokeWidth={isEnlarged ? 3 : 1}
        fill={color || defaultColor}
        isAnimationActive={isEnlarged && !isExporting}
      >
        {isExporting && (
          <LabelList
            dataKey={dataKey}
            position="insideTopRight"
            offset={-20}
            angle="50"
            formatter={value => formatDataValue(value, valueType)}
          />
        )}
      </Line>
    );
  };

  const { isEnlarged, isExporting, viewContent } = props;
  const { chartType, data } = viewContent;
  const Chart = CHART_TYPE_TO_COMPONENT[chartType];
  const aspect = !isEnlarged && !isMobile() && !isExporting ? 1.6 : undefined;

  return (
    <ResponsiveContainer width="100%" height={isExporting ? 320 : undefined} aspect={aspect}>
      <Chart
        data={filterDisabledData(data)}
        margin={isExporting ? { left: 20, right: 20, top: 20, bottom: 20 } : undefined}
      >
        {renderReferenceAreas()}
        {renderXAxis()}
        {renderYAxes()}
        {renderTooltip()}
        {renderLegend()}
        {renderCharts()}
        {renderReferenceLines()}
        {renderBrush()}
      </Chart>
    </ResponsiveContainer>
  );
};

CartesianChart.propTypes = {
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
  /** The main chart configuration */
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE),
};

CartesianChart.defaultProps = {
  isEnlarged: false,
  isExporting: false,
  viewContent: null,
};
