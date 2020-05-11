import {
  CHART_COLOR_PALETTE,
  EXPANDED_CHART_COLOR_PALETTE,
  COMPOSED_CHART_COLOR_PALETTE,
} from '../../../styles';
import { CHART_TYPES } from './chartTypes';

const DYNAMIC_KEY = '$all';

export const parseChartConfig = viewContent => {
  const { chartType, chartConfig, data } = viewContent;
  const { [DYNAMIC_KEY]: dynamicChartConfig, ...restOfConfig } = chartConfig;

  return sortChartConfigByLegendOrder(
    addDefaultsColorsToConfig(
      chartType,
      dynamicChartConfig ? addDynamicConfig(restOfConfig, dynamicChartConfig, data) : restOfConfig,
    ),
  );
};

// Adds default colors for every element with no color defined
const addDefaultsColorsToConfig = (chartType, chartConfig) => {
  const newConfig = {};
  const palette = getDefaultColorsForChart(chartType, Object.keys(chartConfig).length, false);
  const colors = Object.values(palette);

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

const getDefaultColorPalette = (chartType, numberRequired, useExpandedPalette) => {
  if (chartType === CHART_TYPES.COMPOSED) {
    return COMPOSED_CHART_COLOR_PALETTE;
  }
  return numberRequired > Object.keys(CHART_COLOR_PALETTE).length && useExpandedPalette
    ? EXPANDED_CHART_COLOR_PALETTE
    : CHART_COLOR_PALETTE;
};

const getDefaultColorsForChart = (...args) => Object.values(getDefaultColorPalette(...args));

const sortChartConfigByLegendOrder = chartConfig => {
  return Object.entries(chartConfig)
    .sort(([, cfg1], [, cfg2]) => {
      if (Number.isNaN(cfg1.legendOrder) && Number.isNaN(cfg2.legendOrder)) return 0;
      if (Number.isNaN(cfg1.legendOrder)) return -1;
      if (Number.isNaN(cfg2.legendOrder)) return 1;
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

const addDynamicConfig = (chartConfig, dynamicChartConfig, data) => {
  // Just find keys. Doesn't include keys which end in _metadata.
  const keys = [];
  data.forEach(dataPoint => {
    const { timestamp, name, ...restOfData } = dataPoint;
    Object.keys(restOfData).forEach(key => {
      if (!keys.includes(key) && !(key.substr(-9) === '_metadata')) {
        keys.push(key);
      }
    });
  });

  // Add config to each key
  const newChartConfig = { ...chartConfig };
  keys.forEach(key => {
    newChartConfig[key] = { ...dynamicChartConfig };
  });
  return newChartConfig;
};
