import { COLOR_PALETTES } from '../../../styles';
import { getLayeredOpacity } from '../../../utils';
import { CHART_TYPES } from './chartTypes';
import { isDataKey } from './helpers';

const ADD_TO_ALL_KEY = '$all';

export const parseChartConfig = viewContent => {
  const { chartType, chartConfig, data, colorPalette: paletteName } = viewContent;
  const { [ADD_TO_ALL_KEY]: configForAllKeys, ...restOfConfig } = chartConfig;

  const baseConfig = configForAllKeys
    ? createDynamicConfig(restOfConfig, configForAllKeys, data)
    : restOfConfig;

  const addDefaultColors = config => addDefaultColorsToConfig(config, paletteName, chartType);

  const chartConfigs = [baseConfig];

  return chartConfigs.map(addDefaultColors).map(setOpacityValues)[0]; // must remove from array after mapping
};

/**
 * Sets numeric values for each chart config opacity
 */
const setOpacityValues = chartConfig => {
  const newConfig = {};

  Object.entries(chartConfig).forEach(([key, configItem], index, array) => {
    const { opacity } = configItem;
    if (!opacity || typeof opacity === 'number') {
      newConfig[key] = configItem;
      return;
    }
    const newOpacity = getLayeredOpacity(array.length, index, opacity === 'ascending');
    newConfig[key] = { ...configItem, opacity: newOpacity };
  });
  return newConfig;
};

// Adds default colors for every element with no color defined
const addDefaultColorsToConfig = (chartConfig, paletteName, chartType) => {
  const newConfig = {};
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

const getDefaultPaletteName = (chartType, numberRequired) => {
  if (chartType === CHART_TYPES.COMPOSED) {
    return 'COMPOSED_CHART_COLOR_PALETTE';
  }
  return numberRequired > Object.keys(COLOR_PALETTES.CHART_COLOR_PALETTE).length
    ? 'EXPANDED_CHART_COLOR_PALETTE'
    : 'CHART_COLOR_PALETTE';
};

const createDynamicConfig = (chartConfig, dynamicChartConfig, data) => {
  // Just find keys. Doesn't include keys which end in _metadata.
  const dataKeys = data.map(dataPoint => Object.keys(dataPoint).filter(isDataKey)).flat();
  const keys = new Set(dataKeys);

  // Add config to each key
  const newChartConfig = {};
  keys.forEach(key => {
    newChartConfig[key] = { ...dynamicChartConfig, ...chartConfig[key] };
  });
  return newChartConfig;
};
