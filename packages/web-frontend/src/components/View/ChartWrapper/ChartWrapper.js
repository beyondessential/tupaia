import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import {
  CHART_COLOR_PALETTE,
  EXPANDED_CHART_COLOR_PALETTE,
  COMPOSED_CHART_COLOR_PALETTE,
  VIEW_STYLES,
} from '../../../styles';
import { VIEW_CONTENT_SHAPE } from '../propTypes';
import { CartesianChart } from './CartesianChart';
import { CHART_TYPES } from './chartTypes';
import { PieChart } from './PieChart';

// Adds default colors for every element with no color defined
const addDefaultsColorsToConfig = (chartType, chartConfig) => {
  const newConfig = {};
  const palette = getColorPalette(chartType, Object.keys(chartConfig).length, false);
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

const getColorPalette = (chartType, numberRequired, useExpandedPalette) => {
  if (chartType === CHART_TYPES.COMPOSED) {
    return COMPOSED_CHART_COLOR_PALETTE;
  }
  return numberRequired > Object.keys(CHART_COLOR_PALETTE).length && useExpandedPalette
    ? EXPANDED_CHART_COLOR_PALETTE
    : CHART_COLOR_PALETTE;
};

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

const getDynamicChartConfig = viewContent => {
  /*  dynamicChartConfig is of the form
   *  {
   *    baseConfig: { stackId: 1 } // will be added to every key
   *  }
   */
  const { chartType, dynamicChartConfig, data } = viewContent;

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

  const palette = getColorPalette(chartType, keys.length, true);
  const colors = Object.values(palette);

  // Add config to each key
  const chartConfig = {};
  const baseConfig = dynamicChartConfig.baseConfig;
  keys.forEach((key, index) => {
    chartConfig[key] = { ...baseConfig, color: colors[index] };
  });
  return chartConfig;
};

const UnknownChart = () => (
  <div style={VIEW_STYLES.newChartComing}>
    <h2 style={VIEW_STYLES.title}>New chart coming soon</h2>
  </div>
);

export class ChartWrapper extends PureComponent {
  getViewContent() {
    const { viewContent } = this.props;
    const { chartConfig, chartType, dynamicChartConfig } = viewContent;

    if (!chartConfig) {
      return dynamicChartConfig
        ? {
            ...viewContent,
            chartConfig: sortChartConfigByLegendOrder(
              addDefaultsColorsToConfig(chartType, getDynamicChartConfig(viewContent)),
            ),
          }
        : { ...viewContent };
    }
    return {
      ...viewContent,
      chartConfig: sortChartConfigByLegendOrder(addDefaultsColorsToConfig(chartType, chartConfig)),
    };
  }

  render() {
    const viewContent = this.getViewContent();
    const { chartType } = viewContent;

    if (!Object.values(CHART_TYPES).includes(chartType)) {
      return <UnknownChart />;
    }
    const Chart = chartType === CHART_TYPES.PIE ? PieChart : CartesianChart;

    return (
      <div style={VIEW_STYLES.chartViewContainer}>
        <div style={VIEW_STYLES.chartContainer}>
          <Chart {...this.props} viewContent={viewContent} />
        </div>
      </div>
    );
  }
}

ChartWrapper.propTypes = {
  viewContent: PropTypes.shape(VIEW_CONTENT_SHAPE),
};

ChartWrapper.defaultProps = {
  viewContent: null,
};
