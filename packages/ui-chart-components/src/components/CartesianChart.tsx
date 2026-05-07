import React, { useEffect, useState } from 'react';
import { get } from 'es-toolkit/compat';
import {
  AreaChart,
  BarChart,
  ComposedChart,
  LineChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  LegendProps,
} from 'recharts';
import { ChartReport, ChartType, isComposedChartConfig } from '@tupaia/types';
import { DEFAULT_DATA_KEY } from '../constants';
import { LegendPosition, CartesianChartConfig } from '../types';
import { isMobile } from '../utils';
import {
  BarChart as BarChartComponent,
  LineChart as LineChartComponent,
  AreaChart as AreaChartComponent,
} from './Charts';
import { ReferenceLines, ChartTooltip as CustomTooltip } from './Reference';
import { getCartesianChartLegend } from './Legend';
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

const orientationToYAxisId = (orientation?: 'left' | 'right'): number =>
  (orientation && Y_AXIS_IDS[orientation]) || DEFAULT_Y_AXIS.id;

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

const getRealDataKeys = (chartConfig: CartesianChartConfig['chartConfig'] | {}) =>
  chartConfig ? Object.keys(chartConfig).filter(key => key !== LEGEND_ALL_DATA_KEY) : [];

const getLegendAlignment = (
  legendPosition: LegendPosition,
  isExporting: boolean,
): Pick<LegendProps, 'align' | 'verticalAlign'> => {
  if (isExporting) {
    return { verticalAlign: 'top', align: 'right' };
  }
  if (legendPosition === 'bottom') {
    return { verticalAlign: 'bottom', align: 'center' };
  }
  return { verticalAlign: 'top', align: 'left' };
};

const getHeight = (
  isExporting: boolean,
  isEnlarged: boolean,
  hasLegend?: boolean,
  isMobileSize?: boolean,
) => {
  if (isExporting) {
    return 500;
  }
  return isEnlarged && hasLegend && isMobileSize ? 320 : undefined;
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

type CartesianChartType = keyof typeof CHART_TYPE_TO_CONTAINER;

interface CartesianChartProps {
  report: ChartReport;
  config: CartesianChartConfig;
  legendPosition: LegendPosition;
  isEnlarged?: boolean;
  isExporting?: boolean;
}

export const CartesianChart = ({
  report,
  config,
  isEnlarged = false,
  isExporting = false,
  legendPosition = 'bottom',
}: CartesianChartProps) => {
  const initialChartConfig =
    'chartConfig' in config && config.chartConfig ? config.chartConfig : {};
  const [chartConfig, setChartConfig] = useState(initialChartConfig);
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

  const isMobileSize = isMobile(isExporting);

  const { chartType: defaultChartType, valueType, labelType, renderLegendForOneItem } = config;

  const { data = [] } = report;

  const getIsActiveKey = (legendDataKey: string) =>
    activeDataKeys.length === 0 ||
    activeDataKeys.includes(legendDataKey) ||
    legendDataKey === LEGEND_ALL_DATA_KEY;

  const updateChartConfig = (hasDisabledData: boolean) => {
    const newChartConfig = { ...chartConfig };

    if (hasDisabledData && !(LEGEND_ALL_DATA_KEY in newChartConfig)) {
      const getChartType = () => {
        const firstChartConfig = Object.values(chartConfig)[0];
        if (isComposedChartConfig(config) && 'chartType' in firstChartConfig)
          return firstChartConfig.chartType;
        return defaultChartType || ChartType.Line;
      };
      const allChartType = getChartType();
      newChartConfig[LEGEND_ALL_DATA_KEY] = {
        ...LEGEND_ALL_DATA,
        chartType: allChartType,
      };
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
          Object.entries(dataSeries).reduce<Record<string, unknown>>(
            (newDataSeries, [key, value]) => {
              const isInactive = Object.keys(chartConfig).includes(key) && !getIsActiveKey(key);
              if (!isInactive) newDataSeries[key] = value;
              return newDataSeries;
            },
            {},
          ),
        )
      : data;
  };

  const ChartContainer = CHART_TYPE_TO_CONTAINER[defaultChartType as CartesianChartType];
  const hasDataSeries = chartConfig && Object.keys(chartConfig).length > 1;
  const chartDataConfig =
    Object.keys(chartConfig).length > 0 ? chartConfig : { [DEFAULT_DATA_KEY]: {} };
  const hasLegend = hasDataSeries || renderLegendForOneItem;
  const aspect = !isEnlarged && !isMobileSize && !isExporting ? 1.6 : undefined;
  const height = getHeight(isExporting, isEnlarged, hasLegend, isMobileSize);

  const { verticalAlign, align } = getLegendAlignment(legendPosition, isExporting);

  const presentationOptions = 'presentationOptions' in config ? config.presentationOptions : {};

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
        {XAxisComponent({ isEnlarged, isExporting, config, report })}
        {YAxes({ config, report, chartDataConfig, isExporting, isEnlarged })}
        <Tooltip
          filterNull={false}
          content={
            <CustomTooltip
              valueType={valueType}
              labelType={labelType}
              periodGranularity={config.periodGranularity}
              chartConfig={chartConfig}
              presentationOptions={presentationOptions}
              chartType={defaultChartType}
            />
          }
        />
        {hasLegend && isEnlarged && (
          <Legend
            verticalAlign={verticalAlign}
            align={align}
            content={getCartesianChartLegend({
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
            const Chart = CHART_TYPE_TO_CHART[chartType as keyof typeof CHART_TYPE_TO_CONTAINER];
            const yAxisOrientation = get(chartConfig, [dataKey, 'yAxisOrientation']);
            const yAxisId = orientationToYAxisId(yAxisOrientation);

            return Chart({
              valueType,
              ...chartConfig[dataKey as keyof CartesianChartConfig],
              chartConfig,
              dataKey,
              isExporting,
              isEnlarged,
              yAxisId,
              exportWithLabels: presentationOptions?.exportWithLabels,
              data,
            });
          })}
        {ReferenceLines({ report, config, isExporting, isEnlarged })}
      </ChartContainer>
    </ResponsiveContainer>
  );
};
