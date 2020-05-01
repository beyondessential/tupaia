import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import styled from 'styled-components';
import { CHART_COLOR_PALETTE, COMPOSED_CHART_COLOR_PALETTE, VIEW_STYLES } from '../../../styles';
import { VIEW_CONTENT_SHAPE } from '../propTypes';
import { CartesianChart } from './CartesianChart';
import { CHART_TYPES } from './chartTypes';
import { PieChart } from './PieChart';
import { PrimaryButton } from '../../Buttons';

const SelectAllButton = styled(PrimaryButton)`
  position: absolute;
  right: 10px;
  bottom: 10px;
`;

// Adds default colors for every element with no color defined
const addDefaultsColorsToConfig = (chartType, chartConfig) => {
  const newConfig = {};
  const palette =
    chartType === CHART_TYPES.COMPOSED ? COMPOSED_CHART_COLOR_PALETTE : CHART_COLOR_PALETTE;
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

const UnknownChart = () => (
  <div style={VIEW_STYLES.newChartComing}>
    <h2 style={VIEW_STYLES.title}>New chart coming soon</h2>
  </div>
);

export class ChartWrapper extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeDataKeys: [],
    };
  }

  getViewContent() {
    const { viewContent } = this.props;
    const { chartConfig, chartType } = viewContent;
    if (!chartConfig) {
      return viewContent;
    }
    return {
      ...viewContent,
      chartConfig: sortChartConfigByLegendOrder(addDefaultsColorsToConfig(chartType, chartConfig)),
    };
  }

  onLegendClick = event => {
    const { viewContent } = this.props;
    const { chartConfig = {} } = viewContent;
    const allKeys = Object.keys(chartConfig);
    if (this.state.activeDataKeys.includes(event.dataKey)) {
      this.setState(state => ({
        activeDataKeys: state.activeDataKeys.filter(dk => dk !== event.dataKey),
      }));
    } else {
      this.setState(state => ({ activeDataKeys: [...state.activeDataKeys, event.dataKey] }));
    }
    if (this.state.activeDataKeys.length >= allKeys.length - 1) {
      this.setState({ activeDataKeys: [] });
    }
  };

  onClickAll = () => this.setState({ activeDataKeys: [] });

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
          <Chart
            {...this.props}
            onLegendClick={this.onLegendClick}
            activeDataKeys={this.state.activeDataKeys}
            viewContent={viewContent}
          />
          {this.state.activeDataKeys.length >= 1 && (
            <SelectAllButton onClick={this.onClickAll}>All</SelectAllButton>
          )}
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
