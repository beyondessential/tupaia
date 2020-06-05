import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import { VIEW_STYLES } from '../../../styles';
import { VIEW_CONTENT_SHAPE } from '../propTypes';
import { CartesianChart } from './CartesianChart';
import { CHART_TYPES } from './chartTypes';
import { PieChart } from './PieChart';
import { parseChartConfig } from './parseChartConfig';
import { getIsTimeSeries } from './helpers';

const UnknownChart = () => (
  <div style={VIEW_STYLES.newChartComing}>
    <h2 style={VIEW_STYLES.title}>New chart coming soon</h2>
  </div>
);

export class ChartWrapper extends PureComponent {
  getViewContent() {
    const { viewContent } = this.props;
    const { chartConfig, data } = viewContent;
    return chartConfig
      ? {
          ...viewContent,
          data: this.sortData(data),
          chartConfig: parseChartConfig(viewContent),
        }
      : { ...viewContent, data: this.sortData(data) };
  }

  sortData = data =>
    getIsTimeSeries(data) ? data.sort((a, b) => a.timestamp - b.timestamp) : data;

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
