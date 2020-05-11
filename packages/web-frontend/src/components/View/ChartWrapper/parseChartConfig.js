import { COLOR_PALETTES } from '../../../styles';
import { CHART_TYPES } from './chartTypes';

const DYNAMIC_KEY = '$all';
const CUSTOM_PALETTE_KEY = '$colorPalette';

export const parseChartConfig = viewContent => {
  const { chartType, chartConfig, data } = viewContent;
  const {
    [CUSTOM_PALETTE_KEY]: paletteName,
    [DYNAMIC_KEY]: dynamicChartConfig,
    ...restOfConfig
  } = chartConfig;

  return addDefaultsColorsToConfig(
    sortChartConfigByLegendOrder(
      dynamicChartConfig ? addDynamicConfig(restOfConfig, dynamicChartConfig, data) : restOfConfig,
    ),
    paletteName,
    chartType,
  );
};

// Adds default colors for every element with no color defined
const addDefaultsColorsToConfig = (chartConfig, paletteName, chartType) => {
  const newConfig = {};

  const colors = paletteName
    ? getColorsFromPalette(paletteName)
    : getDefaultColorsForChart(chartType, Object.keys(chartConfig).length, false);

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

const getDefaultColorPalette = (chartType, numberRequired) => {
  if (chartType === CHART_TYPES.COMPOSED) {
    return COLOR_PALETTES.COMPOSED_CHART_COLOR_PALETTE;
  }
  return numberRequired > Object.keys(COLOR_PALETTES.CHART_COLOR_PALETTE).length
    ? COLOR_PALETTES.EXPANDED_CHART_COLOR_PALETTE
    : COLOR_PALETTES.CHART_COLOR_PALETTE;
};

const getDefaultColorsForChart = (chartType, numberRequired) =>
  Object.values(getDefaultColorPalette(chartType, numberRequired));

const getColorsFromPalette = paletteName => Object.values(COLOR_PALETTES[paletteName]);

// Bad practice to rely on object ordering: https://stackoverflow.com/questions/9179680/is-it-acceptable-style-for-node-js-libraries-to-rely-on-object-key-order
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
  const newChartConfig = {};
  keys.forEach(key => {
    newChartConfig[key] = { ...dynamicChartConfig, ...chartConfig[key] };
  });
  return newChartConfig;
};
