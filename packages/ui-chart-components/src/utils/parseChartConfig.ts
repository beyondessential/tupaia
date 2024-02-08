/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 *
 */
import {
  BaseChartConfig,
  ChartConfigObject,
  ChartConfigT,
  ChartData,
  ChartType,
} from '@tupaia/types';
import { COLOR_PALETTES } from '../constants';
import { LooseObject, UnparsedChartViewContent } from '../types';
import { isDataKey } from './utils';

export const ADD_TO_ALL_KEY = '$all';

export const getLayeredOpacity = (numberOfLayers: number, index: number, ascending = false) =>
  ascending ? (index + 1) / numberOfLayers : 1 - index / numberOfLayers;

type ColorPalette = keyof typeof COLOR_PALETTES;

type ChartConfigFromUnparsedT<T> = T extends { chartConfig: unknown }
  ? T['chartConfig']
  : Record<string, never>;

export const parseChartConfig = <T extends UnparsedChartViewContent>(
  viewContent: T,
): ChartConfigFromUnparsedT<T> => {
  const { chartType, data, colorPalette: paletteName } = viewContent;
  if (!('chartConfig' in viewContent)) {
    return {} as ChartConfigFromUnparsedT<T>;
  }

  if (!viewContent.chartConfig) {
    return {} as ChartConfigFromUnparsedT<T>;
  }

  const { chartConfig } = viewContent;
  const configForAllKeys = ADD_TO_ALL_KEY in chartConfig ? chartConfig[ADD_TO_ALL_KEY] : null;

  // Remove '$all' key and the 'name' from chart config - we can't use a spread here because some types don't have this key, so we need to filter it out and use a type guard above to get the '$all' config
  const restOfConfig = Object.fromEntries(
    Object.entries(chartConfig).filter(([key]) => key !== ADD_TO_ALL_KEY && key !== 'name'),
  );

  const baseConfig = configForAllKeys
    ? createDynamicConfig(restOfConfig, configForAllKeys, data)
    : restOfConfig;

  const addDefaultColors = (config: any) =>
    addDefaultColorsToConfig(config, paletteName as ColorPalette, chartType);

  const chartConfigs = [baseConfig];

  const parsedChartConfig = chartConfigs
    .map(sortChartConfigByLegendOrder)
    .map(addDefaultColors)
    .map(setOpacityValues)[0];

  // Forced to explicitly cast here as the types in this function are too messy to manage
  return parsedChartConfig as ChartConfigFromUnparsedT<T>;
};

/**
 * Sets numeric values for each chart config opacity
 */
const setOpacityValues = (chartConfig: LooseObject) => {
  const newConfig: LooseObject = {};

  Object.entries(chartConfig).forEach(([key, configItem], index, array) => {
    const { opacity } = configItem;
    if (!opacity || typeof opacity === 'number') {
      newConfig[key] = configItem;
      return;
    }
    const newOpacity = getLayeredOpacity(array.length, index, opacity === 'ascending');
    newConfig[key] = { ...configItem, opacity: newOpacity };
  });
  return newConfig as ChartConfigT;
};

// Adds default colors for every element with no color defined
const addDefaultColorsToConfig = (
  chartConfig: BaseChartConfig,
  paletteName: ColorPalette,
  chartType: ChartType,
) => {
  const newConfig: LooseObject = {};

  const palette = paletteName || getDefaultPaletteName(chartType, Object.keys(chartConfig).length);
  const colors = Object.values(COLOR_PALETTES[palette]);

  let colorId = 0;
  Object.entries(chartConfig).forEach(([key, configItem]) => {
    let { color } = configItem;
    if (!color) {
      color = colors[colorId];
      colorId = (colorId + 1) % colors.length;
    }

    newConfig[key] = { ...configItem, color };
  });

  return newConfig;
};

const getDefaultPaletteName = (chartType: ChartType, numberRequired: number): string => {
  if (chartType === ChartType.Composed) {
    return 'COMPOSED_CHART_COLOR_PALETTE';
  }
  return numberRequired > Object.keys(COLOR_PALETTES.CHART_COLOR_PALETTE).length
    ? 'EXPANDED_CHART_COLOR_PALETTE'
    : 'CHART_COLOR_PALETTE';
};

// Used to layer line charts on top of bar charts for composed charts.
const CHART_SORT_ORDER = {
  [ChartType.Line]: 0,
  [ChartType.Bar]: 1,
};

const defaultSort = (a: { chartType: 'bar' | 'line' }[], b: { chartType: 'bar' | 'line' }[]) => {
  return CHART_SORT_ORDER[b[1].chartType] - CHART_SORT_ORDER[a[1].chartType];
};

// Bad practice to rely on object ordering: https://stackoverflow.com/questions/9179680/is-it-acceptable-style-for-node-js-libraries-to-rely-on-object-key-order
const sortChartConfigByLegendOrder = (chartConfig: LooseObject) => {
  return Object.entries(chartConfig)
    .sort(defaultSort)
    .sort(([, cfg1], [, cfg2]) => {
      if (isNaN(cfg1.legendOrder) && isNaN(cfg2.legendOrder)) return 0;
      if (isNaN(cfg1.legendOrder)) return 1;
      if (isNaN(cfg2.legendOrder)) return -1;
      return cfg1.legendOrder - cfg2.legendOrder;
    })
    .reduce(
      (newChartConfig, [key, val]) => ({
        ...newChartConfig,
        [key]: val,
      }),
      {},
    );
};

const createDynamicConfig = (
  chartConfig: ChartConfigObject,
  dynamicChartConfig: ChartConfigObject,
  data: ChartData[],
) => {
  // Just find keys. Doesn't include keys which end in _metadata.
  const dataKeys = data.map(dataPoint => Object.keys(dataPoint).filter(isDataKey)).flat();
  const keys = new Set(dataKeys);

  // Add config to each key
  const newChartConfig: LooseObject = {};
  keys.forEach(key => {
    newChartConfig[key] = {
      ...dynamicChartConfig,
      ...chartConfig[key as keyof ChartConfigObject],
    };
  });
  return newChartConfig;
};
